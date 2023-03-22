import { logging, provider } from '/Users/gmelton/work/automate/core/mod.ts';

// create logger
const log = logging.Category('provider.automate.ext.docker@0.0.0');

// BuildValues used to generate
// `docker build` commands with
export type BuildValues = {
  provider: {
    docker: {
      build: {
        name: string;
        sh?: string;
        context?: string;
        dockerfile?: string;
        tags?: string[];
        env?: string[];
      };
    };
  };
};

// RunValues used to generate
// `docker build` commands with
export type RunValues = {
  provider: {
    docker: {
      run: {
        image: string;
        shell?: string;
        cmd?: string | string[];
        // docker run cli options
        options?: string[];
        // TBD... do we need these if we
        // have options
        volumes?: string;
        entrypoint?: string;
        workdir?: string;
        env?: string[];
      };
    };
  };
};

export class ProviderDocker extends provider.Provider {
  cmd = 'docker';

  constructor() {
    super();
  }

  /**
   * Generates `docker run [OPTIONS] IMAGE [COMMAND] [ARG...]` command
   *
   * If you need to run multiple commands where you need to
   * change the state of the container for subsequent
   * commands then do this using bash/sh scripts.
   *
   * For some reason, chaining `program1 & program2` using Deno.run(..)
   * doesn't work when calling `docker run image COMMANDS. Not sure why,
   * because the same command works on the command line...
   *
   * @param values
   * @returns
   */
  async run(values: RunValues): Promise<Deno.ProcessStatus> {
    log.info(`${this.className}.run ${JSON.stringify(values)}`);

    // All commands are run as shell commands using the `shell`
    // (not all containers ship /bin/bash so be careful)
    const shell = values.provider.docker.run.shell;
    const image = values.provider.docker.run.image;
    const cmd = values.provider.docker.run.cmd || [];
    const options = values.provider.docker.run.options || [];
    // figure out if we want to break these out into sep
    // properties or just use options for now
    const volumes = values.provider.docker.run.volumes || [];
    // const entrypoint = values.provider.docker.run.entrypoint;
    const env = values.provider.docker.run.env || [];

    // // check if entrypoint exists in options:
    // if (entrypoint !== undefined && options.indexOf('--entrypoint') < 0) {
    //   options.push(`--entrypoint=${entrypoint}`);
    // }
    // // set env variables
    // const runEnv = env.map((keyVal: string) => {
    //   // TODO check if key val already exists in the options
    //   return `--env ${keyVal}`;
    // });

    // use /bin/bash
    let runCmd: string[];
    if (typeof cmd === 'string') {
      runCmd = [cmd];
    } else {
      runCmd = cmd;
    }

    // we might have a shell script to run instead?
    if (shell !== undefined) {
      runCmd = [shell, '-c', `${runCmd.join(' ')}`];
    }

    // prepare the docker run options
    const opts: Deno.RunOptions = {
      cmd: [
        this.cmd,
        'run',
        ...env,
        ...volumes,
        ...options,
        image,
        ...runCmd,
      ],
    };
    log.debug(`Running shell: ${JSON.stringify(opts)}`);
    console.log('');
    console.log(`#[${opts.cmd.join(' ')}]`);
    console.log('');
    const result = await this.sh(opts);
    console.log('');
    return Promise.resolve(result);
  }
}

// All providers must export this function...
// deno-lint-ignore require-await
export const initializeProvider = async (): Promise<ProviderDocker> => {
  const instance = new ProviderDocker();
  return Promise.resolve(instance);
};
