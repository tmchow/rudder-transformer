import {
  WorkflowEngine,
  WorkflowEngineFactory,
  TemplateType,
  ExecutionBindings,
  StepOutput,
} from 'rudder-workflow-engine';

import tags from '../../v0/util/tags';

import {
  getErrorInfo,
  getRootPathForDestination,
  getWorkflowPath,
  getPlatformBindingsPaths,
  isCdkV2Destination,
} from './utils';

const defTags = {
  [tags.TAG_NAMES.IMPLEMENTATION]: tags.IMPLEMENTATIONS.CDK_V2,
};

export function getEmptyExecutionBindings() {
  const context = {};
  return {
    outputs: {},
    context,
    setContext: (key: string, value: any) => {
      context[key] = value;
    },
  };
}

export async function getWorkflowEngine(
  destName: string,
  feature: string,
  bindings: Record<string, any> = {},
) {
  const destRootDir = getRootPathForDestination(destName);
  const workflowPath = await getWorkflowPath(destRootDir, feature);
  const platformBindingsPaths = await getPlatformBindingsPaths();
  return WorkflowEngineFactory.createFromFilePath(workflowPath, {
    rootPath: destRootDir,
    bindingsPaths: platformBindingsPaths,
    creationTimeBindings: bindings,
    templateType: TemplateType.JSON_TEMPLATE,
  });
}

const workflowEnginePromiseMap = new Map();

export function getCachedWorkflowEngine(
  destName: string,
  feature: string,
  bindings: Record<string, any> = {},
): WorkflowEngine {
  // Create a new instance of the engine for the destination if needed
  // TODO: Use cache to avoid long living engine objects
  workflowEnginePromiseMap[destName] = workflowEnginePromiseMap[destName] || new Map();
  if (!workflowEnginePromiseMap[destName][feature]) {
    workflowEnginePromiseMap[destName][feature] = getWorkflowEngine(destName, feature, bindings);
  }
  return workflowEnginePromiseMap[destName][feature];
}

export async function executeWorkflow(workflowEngine: WorkflowEngine, parsedEvent: any) {
  try {
    const result = await workflowEngine.execute(parsedEvent);
    // TODO: Handle remaining output scenarios
    return result.output;
  } catch (error) {
    throw getErrorInfo(error, isCdkV2Destination(parsedEvent), defTags);
  }
}

export async function processCdkV2Workflow(
  destType: string,
  parsedEvent: any,
  feature: string,
  bindings: Record<string, any> = {},
) {
  try {
    const workflowEngine = await getCachedWorkflowEngine(destType, feature, bindings);
    return await executeWorkflow(workflowEngine, parsedEvent);
  } catch (error) {
    throw getErrorInfo(error, isCdkV2Destination(parsedEvent), defTags);
  }
}

export function executeStep(
  workflowEngine: WorkflowEngine,
  stepName: string,
  input: any,
  bindings?: ExecutionBindings,
): Promise<StepOutput> {
  return workflowEngine
    .getStepExecutor(stepName)
    .execute(input, Object.assign(workflowEngine.bindings, getEmptyExecutionBindings(), bindings));
}
