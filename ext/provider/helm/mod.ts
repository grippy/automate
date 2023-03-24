import { automate } from '../../deps.ts';
import { provider_docker as docker } from '../../mod.ts';

const { logging } = automate;

type ProviderDocker = docker.ProviderDocker;
type DockerRunValues = docker.RunValues;

// create logger
const log = logging.Category('provider.automate.ext.helm@0.0.0');

// Placeholder for merging provider.docker.run.image name
// deno-lint-ignore ban-types
type EmptyValues = {};

/**
 * InstallValues input values
 */
type InstallValues = {
  provider: {
    helm: {
      install: {
        release_name: string;
        chart: string;
        flags?: string[];
      };
    };
  };
};

/**
 * RepoAddValues input values
 */
type RepoAddValues = {
  provider: {
    helm: {
      repo: Record<string, string>;
      flags?: string[];
    };
  };
};

type UninstallValues = {
  provider: {
    helm: {
      uninstall: {
        release_name: string;
        flags?: string[];
      };
    };
  };
};

class ProviderHelm extends automate.provider.Provider {
  /**
   * This provider runs helm commands using docker.
   */

  cmd = 'helm';
  docker: ProviderDocker;

  constructor(docker: ProviderDocker) {
    super();
    this.docker = docker;
  }

  /**
   * @returns
   */
  async version(values: EmptyValues): Promise<Deno.ProcessStatus> {
    const defaultValues: DockerRunValues = {
      provider: {
        docker: {
          run: {
            image: '',
            cmd: [this.cmd, 'version'],
          },
        },
      },
    };
    const runValues = this.mergeValues<DockerRunValues>([
      defaultValues,
      values,
    ]);

    const result = await this.docker.run(runValues);
    if (!result.success) {
      Promise.reject(new Error('helm helm commands failed'));
    }

    return Promise.resolve(result);
  }

  async help(values: EmptyValues): Promise<Deno.ProcessStatus> {
    const shCmd = ` \
    ${this.cmd} --help && \
    ${this.cmd} repo add --help && \
    ${this.cmd} install --help && \
    ${this.cmd} uninstall --help`;

    const defaultValues: DockerRunValues = {
      provider: {
        docker: {
          run: {
            image: '',
            shell: '/bin/bash',
            cmd: shCmd,
          },
        },
      },
    };
    const runValues = this.mergeValues<DockerRunValues>([
      defaultValues,
      values,
    ]);

    const result = await this.docker.run(runValues);
    return Promise.resolve(result);
  }

  /**
   * Generates helm command to add repo and install a chart.
   *
   * `helm repo add [NAME] [URL] [flags] ...` &&
   * `helm install [NAME] [CHART] [flags]`
   * @param values
   * @returns
   */
  async install(
    values: InstallValues & RepoAddValues,
  ): Promise<Deno.ProcessStatus> {
    log.info(`install input: ${JSON.stringify(values)}`);

    // get helm.rep values
    const repo = values.provider.helm.repo || {};
    const flags = values.provider.helm.install.flags || [];

    // create single commands
    const cmds = [];

    // Prepare `helm repo add`
    for (const [name, url] of Object.entries(repo)) {
      cmds.push(`${this.cmd} repo add ${name} ${url} ${flags.join(' ')}`);
    }

    // Prepare helm install command
    const release_name = values.provider.helm.install.release_name;
    const chart = values.provider.helm.install.chart;
    cmds.push(
      `${this.cmd} install ${release_name} ${chart} ${flags.join(' ')}`,
    );

    // Merge values for provider docker run cmd...
    // the input `values` should container an image
    // we want to use here:
    const defaultValues: DockerRunValues = {
      provider: {
        docker: {
          run: {
            image: '',
            shell: '/bin/bash',
            cmd: cmds.join(' && '),
          },
        },
      },
    };

    const runValues = this.mergeValues<DockerRunValues>([
      defaultValues,
      values,
    ]);
    const result = await this.docker.run(runValues);
    if (!result.success) {
      Promise.reject(new Error('helm install commands failed'));
    }
    return Promise.resolve(result);
  }

  /**
   * Generate `helm uninstall RELEASE_NAME [flags]` commands
   * @param values
   * @returns
   */
  async uninstall(values: UninstallValues): Promise<Deno.ProcessStatus> {
    log.debug(`delete input: ${JSON.stringify(values)}`);

    // prepare the docker run options...
    const helmCmd = [
      this.cmd,
      'uninstall',
      values.provider.helm.uninstall.release_name,
      ...(values.provider.helm.uninstall.flags || []),
    ];

    // Merge values for provider docker run cmd
    const defaultValues: DockerRunValues = {
      provider: {
        docker: {
          run: {
            image: '',
            cmd: helmCmd,
          },
        },
      },
    };
    const runValues = this.mergeValues<DockerRunValues>([
      defaultValues,
      values,
    ]);
    const result = await this.docker.run(runValues);
    if (!result.success) {
      Promise.reject(new Error('helm uninstall cmd failed'));
    }
    return Promise.resolve(result);
  }
}

// All providers must export this function...
export const initializeProvider = async (): Promise<
  automate.provider.Provider
> => {
  const _docker = await docker.initializeProvider();
  const instance = new ProviderHelm(_docker);
  return Promise.resolve(instance);
};
