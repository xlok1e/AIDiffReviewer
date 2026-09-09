import { FileCode2 } from 'lucide-react';
import type { ComponentType } from 'react';
import {
  SiCss,
  SiHtml5,
  SiJavascript,
  SiJson,
  SiMarkdown,
  SiReact,
  SiRust,
  SiSass,
  SiToml,
  SiTypescript,
  SiYaml,
} from 'react-icons/si';

import type { FileRowProps } from './AppShellComponents.types';

type FileTypeIconComponent = ComponentType<{ className?: string; size?: number }>;

interface FileTypeIconViewModel {
  Icon: FileTypeIconComponent;
  colorClassName: string;
}

const EXTENSION_ICON_MAP: Record<string, FileTypeIconViewModel> = {
  ts: { Icon: SiTypescript, colorClassName: 'text-[#3178C6]' },
  tsx: { Icon: SiReact, colorClassName: 'text-[#61DAFB]' },
  js: { Icon: SiJavascript, colorClassName: 'text-[#F7DF1E]' },
  jsx: { Icon: SiReact, colorClassName: 'text-[#61DAFB]' },
  mjs: { Icon: SiJavascript, colorClassName: 'text-[#F7DF1E]' },
  cjs: { Icon: SiJavascript, colorClassName: 'text-[#F7DF1E]' },
  rs: { Icon: SiRust, colorClassName: 'text-foreground' },
  json: { Icon: SiJson, colorClassName: 'text-muted-foreground' },
  css: { Icon: SiCss, colorClassName: 'text-[#1572B6]' },
  scss: { Icon: SiSass, colorClassName: 'text-[#CC6699]' },
  md: { Icon: SiMarkdown, colorClassName: 'text-muted-foreground' },
  toml: { Icon: SiToml, colorClassName: 'text-[#9C4221]' },
  yml: { Icon: SiYaml, colorClassName: 'text-[#CB171E]' },
  yaml: { Icon: SiYaml, colorClassName: 'text-[#CB171E]' },
  html: { Icon: SiHtml5, colorClassName: 'text-[#E34F26]' },
};

const DEFAULT_ICON: FileTypeIconViewModel = {
  Icon: FileCode2,
  colorClassName: 'text-muted-foreground',
};

function getFileExtension(fileName: string): string {
  const lastDotIndex = fileName.lastIndexOf('.');
  return lastDotIndex === -1 ? '' : fileName.slice(lastDotIndex + 1).toLowerCase();
}

// Resolves the technology logo and brand color for a file's extension, with a generic fallback.
export function useFileTypeIcon({ file }: Pick<FileRowProps, 'file'>): FileTypeIconViewModel {
  return EXTENSION_ICON_MAP[getFileExtension(file.fileName)] ?? DEFAULT_ICON;
}
