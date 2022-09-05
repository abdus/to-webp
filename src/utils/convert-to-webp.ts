import fs from 'fs';
import { execSync } from 'child_process';

type Presets = 'default' | 'photo' | 'picture' | 'drawing' | 'icon' | 'text';
type Config = {
  q?: number; // quality factor
  size?: number; // target size
  preset?: Presets;
  resize?: string; // pass zero to preserve original
  lossless?: boolean; // encode image losslessly
};

function formatOpts(key: string, value: string) {
  if (key && value) return ` -${key} ${value} `;
  return '';
}

function getConfigString(conf: Config) {
  return Object.keys(conf).reduce(
    (prev, curr) => prev + formatOpts(curr, (conf as any)[curr]),
    '',
  );
}

export function convertToWebP(
  source: fs.PathLike,
  destination: fs.PathLike,
  config?: Config,
) {
  const doesCwebPExists = execSync('cwebp -version');
  const doesSourceExists = fs.existsSync(source);

  if (!doesSourceExists) {
    throw Error(`source does not exists: ${source}`);
  }

  if (!doesCwebPExists) {
    throw Error(`cwebp is not installed. please install it${destination}`);
  }

  execSync(
    `cwebp '${source}' ${
      config ? getConfigString(config) : ''
    } -o '${destination}'`,
    {
      stdio: 'inherit',
    },
  );
}
