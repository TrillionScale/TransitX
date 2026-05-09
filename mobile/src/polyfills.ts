import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';
import { Buffer } from 'buffer';
import process from 'process';

const g = globalThis as any;
if (!g.Buffer) g.Buffer = Buffer;
if (!g.process) g.process = process;
