import { Test } from '@nestjs/testing';

import { WorkspaceActivationStatus } from 'twenty-shared/workspace';

import { CoreEntityCacheService } from 'src/engine/core-entity-cache/services/core-entity-cache.service';
import { ApplicationStopService } from 'src/engine/core-modules/application/application-stop/application-stop.service';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { LogicFunctionExecutionThrottleService } from 'src/engine/core-modules/logic-function/logic-function-execution-throttle/logic-function-execution-throttle.service';
import { LogicFunctionExecutorService } from 'src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor.service';
import { LogicFunctionExceptionCode } from 'src/engine/metadata-modules/logic-function/logic-function.exception';

const FLAT_APPLICATION = {
  id: 'application-id',
  workspaceId: 'workspace-id',
  universalIdentifier: 'application-universal-identifier',
} as FlatApplication;

const buildExecutorService = async ({
  activationStatus = WorkspaceActivationStatus.ACTIVE,
  isApplicationStopped = false,
}: {
  activationStatus?: WorkspaceActivationStatus;
  isApplicationStopped?: boolean;
}) => {
  const consumeToken = jest.fn().mockResolvedValue(true);

  const testingModule = await Test.createTestingModule({
    providers: [
      LogicFunctionExecutorService,
      {
        provide: ApplicationStopService,
        useValue: {
          isApplicationStopped: jest
            .fn()
            .mockResolvedValue(isApplicationStopped),
        },
      },
      {
        provide: CoreEntityCacheService,
        useValue: { get: jest.fn().mockResolvedValue({ activationStatus }) },
      },
      {
        provide: LogicFunctionExecutionThrottleService,
        useValue: { consumeToken },
      },
    ],
  })
    .useMocker(() => ({}))
    .compile();

  return {
    logicFunctionExecutorService: testingModule.get(
      LogicFunctionExecutorService,
    ),
    consumeToken,
  };
};

describe('LogicFunctionExecutorService.executeBuiltCode', () => {
  it('rejects a run of a stopped application without building its code', async () => {
    const { logicFunctionExecutorService } = await buildExecutorService({
      isApplicationStopped: true,
    });

    const getBuiltHandlerPath = jest.fn();

    await expect(
      logicFunctionExecutorService.executeBuiltCode({
        workspaceId: 'workspace-id',
        flatApplication: FLAT_APPLICATION,
        getBuiltHandlerPath,
        payload: {},
      }),
    ).rejects.toMatchObject({
      code: LogicFunctionExceptionCode.LOGIC_FUNCTION_DISABLED,
    });

    expect(getBuiltHandlerPath).not.toHaveBeenCalled();
  });

  it.each([
    WorkspaceActivationStatus.PENDING_CREATION,
    WorkspaceActivationStatus.ONGOING_CREATION,
    WorkspaceActivationStatus.CREATED,
    WorkspaceActivationStatus.SUSPENDED,
  ])(
    'rejects a run in a %s workspace without spending a token or building its code',
    async (activationStatus) => {
      const { logicFunctionExecutorService, consumeToken } =
        await buildExecutorService({ activationStatus });

      const getBuiltHandlerPath = jest.fn();

      await expect(
        logicFunctionExecutorService.executeBuiltCode({
          workspaceId: 'workspace-id',
          flatApplication: FLAT_APPLICATION,
          getBuiltHandlerPath,
          payload: {},
        }),
      ).rejects.toMatchObject({
        code: LogicFunctionExceptionCode.LOGIC_FUNCTION_DISABLED,
        message: 'Workspace workspace-id is not active',
      });

      expect(consumeToken).not.toHaveBeenCalled();
      expect(getBuiltHandlerPath).not.toHaveBeenCalled();
    },
  );
});
