const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '..');

const config = getDefaultConfig(projectRoot);

// 모노레포: packages/xrpl-core 소스를 직접 참조 (별도 빌드 없이 Metro가 트랜스파일).
config.watchFolders = [path.resolve(monorepoRoot, 'packages')];

// 의존성 해석은 mobile/node_modules 우선 → xrpl-core 안의 `import 'xrpl'`도 mobile의 xrpl(폴리필 적용본)으로.
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];
config.resolver.disableHierarchicalLookup = true;

config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  stream: require.resolve('stream-browserify'),
  buffer: require.resolve('buffer'),
  process: require.resolve('process'),
  events: require.resolve('events'),
  crypto: require.resolve('react-native-get-random-values'),
};

module.exports = config;
