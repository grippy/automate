import { automate, cliffy } from '../../deps.ts';

const { logging, template } = automate;
const log = logging.Category('automate.workspace.init');

// scaffolding...
const automateConfigFileName = 'Automate.yaml';
const automateConfig = `
workspace:
  name: {{ name }}
  # list paths to workspace packages
  members: []
`;

const gitIgnoreFileName = '.gitignore';
const gitIgnore = `
.automate/
`;

const denoJsonFileName = 'deno.jsonc';
const denoJson = `
{
  "compilerOptions": {},
  "tasks": {
    "dev": "deno run --watch main.ts"
  }
}
`;

/**
 * Action initializes a new workspace
 * @param options
 * @param path
 */
const action = (options: any, path: string) => {
  if (path === '/') {
    throw new Error("Writing to root isn't support for this command!");
  }

  log.info('Initialize workspace...');

  // should check if path exists and already has these files
  if (path === '.') {
    path += '/';
  } else if (
    !path.startsWith('/') &&
    !path.startsWith('./')
  ) {
    // we have a relative path...
    // prepend with `./`
    path = `./${path}`;
  }

  // check if path already exits
  log.debug(`Checking if path ${path} already exists`);
  try {
    Deno.readDirSync(path);
    log.debug(`Path ${path} exists... skip making directory`);
  } catch (e: unknown) {
    if (e instanceof Deno.errors.NotFound) {
      log.debug(`Create path ${path}...`);
      Deno.mkdirSync(path, { recursive: true });
    }
  }

  // strip slash off the end so we can create file paths...
  if (path.endsWith('/')) {
    path = path.substring(0, path.lastIndexOf('/'));
  }
  // use absolute path from here on out...
  path = Deno.realPathSync(path);

  // Get the name of the project.
  // or use the current dir as the default
  // or pick this awesome default...
  let name = options.name;
  if (name === undefined) {
    const parts = path.split('/');
    if (parts.length > 1) {
      name = parts[parts.length - 1];
      log.info(`Set workspace.name to current directory name, '${name}'`);
    }
  }
  if (name === undefined) {
    name = 'super-awesome-workspace';
  }

  const writeFiles = [
    {
      fileName: `${path}/${automateConfigFileName}`,
      file: automateConfig,
      data: { name: name },
    },
    {
      fileName: `${path}/${gitIgnoreFileName}`,
      file: gitIgnore,
      data: {},
    },
    {
      fileName: `${path}/${denoJsonFileName}`,
      file: denoJson,
      data: {},
    },
  ];

  for (const k in writeFiles) {
    const file = writeFiles[k];
    try {
      if (options.force) {
        throw new Deno.errors.NotFound();
      }
      Deno.readTextFileSync(file.fileName);
      log.warn(`File ${file.fileName} already exists, skipping it.`);
    } catch (e: unknown) {
      if (e instanceof Deno.errors.NotFound) {
        log.info(`Writing file ${file.fileName}`);
        const data = template.render(file.file, file.data);
        Deno.writeTextFileSync(file.fileName, data);
      }
    }
  }
};

/**
 * Workspace init sub-command
 */
export const init = new cliffy.Command()
  .description(
    'Initialize new automate workspace at the specified path. Use `.` for the current directory.',
  )
  .arguments('<path:string>')
  .option('-n, --name <name:string>', 'Set workspace name')
  .option(
    '-f, --force [force:boolean]',
    'Force create workspace if it already exists',
    { default: false, standalone: true },
  )
  .action(action);
