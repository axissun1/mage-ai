import { useMemo } from 'react';

import ProjectType, { FeatureUUIDEnum } from '@interfaces/ProjectType';
import api from '@api';
import { featureEnabled } from '.';

export type UseProjectType = {
  featureEnabled: (featureUUID: FeatureUUIDEnum) => boolean;
  // @ts-ignore
  featureUUIDs: {
    ADD_NEW_BLOCK_V2: FeatureUUIDEnum;
    COMPUTE_MANAGEMENT: FeatureUUIDEnum;
    CUSTOM_DESIGN: FeatureUUIDEnum;
    DATA_INTEGRATION_IN_BATCH_PIPELINE: FeatureUUIDEnum;
    INTERACTIONS: FeatureUUIDEnum;
    NOTEBOOK_BLOCK_OUTPUT_SPLIT_VIEW: FeatureUUIDEnum;
    LOCAL_TIMEZONE: FeatureUUIDEnum;
    OPERATION_HISTORY: FeatureUUIDEnum;
  };
  fetchProjects: () => any;
  project: ProjectType;
  projectPlatformActivated?: boolean;
  rootProject?: ProjectType;
  sparkEnabled: boolean;
};

type UseProjectProps = {
  pauseFetch?: boolean;
};

function useProject({
  pauseFetch,
}: UseProjectProps = {
  pauseFetch: false,
}): UseProjectType {
  const { data: dataProjects, mutate: fetchProjects } = api.projects.list({}, {
    revalidateOnFocus: false,
  }, {
    pauseFetch,
  });
  const {
    project,
    rootProject,
  }: {
    project: ProjectType;
    rootProject: ProjectType;
  } = useMemo(() => {
    let project2;
    let rootProject2;

    (dataProjects?.projects || [])?.forEach((project3) => {
      if (project2 && rootProject2) {
        return;
      }

      if (project3?.root_project) {
        if (!rootProject2) {
          rootProject2 = project3;
        }
      } else {
        if (!project2) {
          project2 = project3;
        }
      }
    });

    if (rootProject2 && !project2) {
      project2 = rootProject2;
      rootProject2 = null;
    }

    return {
      project: project2,
      rootProject: rootProject2,
    };
  }, [dataProjects]);

  const computeManagementEnabled: boolean =
    featureEnabled(project, FeatureUUIDEnum.COMPUTE_MANAGEMENT);

  return {
    featureEnabled: (featureUUID: FeatureUUIDEnum): boolean => featureEnabled(project, featureUUID),
    featureUUIDs: FeatureUUIDEnum,
    fetchProjects,
    project,
    projectPlatformActivated: project?.name !== rootProject?.name,
    rootProject,
    sparkEnabled: computeManagementEnabled
      && (project.spark_config || project.emr_config)
      && (
        Object.keys(project.spark_config || {})?.length >= 1
          || Object.keys(project.emr_config || {})?.length >= 1
      ),
  };
}

export default useProject;
