import { Test, Option, FeatureFlag, Environment } from "@prisma/client";
import prettier from "prettier";
import path from "path";
import * as fs from "fs/promises";
import { getHighlighter } from "shiki";

// Shiki loads languages and themes using "fs" instead of "import", so Next.js
// doesn't bundle them into production build. To work around, we manually copy
// them over to our source code (lib/shiki/*) and update the "paths".
//
// Note that they are only referenced on server side
// See: https://github.com/shikijs/shiki/issues/138
const getShikiPath = (): string => {
  return path.join(process.cwd(), "src/lib/shiki");
};

const touched = { current: false };

// "Touch" the shiki assets so that Vercel will include them in the production
// bundle. This is required because shiki itself dynamically access these files,
// so Vercel doesn't know about them by default
const touchShikiPath = (): void => {
  if (touched.current) return; // only need to do once
  fs.readdir(getShikiPath()); // fire and forget
  touched.current = true;
};

const formatCode = (code: string) => {
  return prettier.format(
    code.replace('"process.env.NODE_ENV"', "process.env.NODE_ENV"),
    {
      parser: "typescript",
    }
  );
};

export type CodeSnippetData = {
  code: string;
  html: string;
};

export type Integrations = "react" | "nextjs" | "svelte";

export async function generateCodeSnippets({
  projectId,
  tests,
  flags,
}: {
  projectId: string;
  tests: Array<
    Pick<Test, "name"> & {
      options: Pick<Option, "identifier">[];
    }
  >;
  flags: Array<Pick<FeatureFlag, "name">>;
}): Promise<Record<Integrations, CodeSnippetData>> {
  touchShikiPath();

  const baseConfig = JSON.stringify(
    {
      projectId,
      currentEnvironment: "process.env.NODE_ENV",
      tests: tests.reduce((acc, test) => {
        acc[test.name] = {
          variants: test.options.map((option) => option.identifier),
        };
        return acc;
      }, {} as Record<string, any>),
      flags: Array.from(new Set(flags.map((flag) => flag.name))),
    },
    null,
    2
  );

  const reactCode = formatCode(
    `import { createAbby } from "@tryabby/react"; 
    
    export const { useAbby, AbbyProvider, useFeatureFlag } = createAbby(${baseConfig})`
  );

  const nextJsCode = formatCode(
    `import { createAbby } from "@tryabby/next"; 
    
    export const { useAbby, AbbyProvider, useFeatureFlag, withAbby } = createAbby(${baseConfig})`
  );

  const svelteCode = formatCode(
    `import { createAbby } from "@tryabby/svelte"; 
    
    export const { useAbby, AbbyProvider, useFeatureFlag, withAbby } = createAbby(${baseConfig})`
  )

  const highlighter = await getHighlighter({
    // it is in-fact a proper theme, but the types are wrong
    theme: "poimandres",
    paths: {
      languages: `${getShikiPath()}/languages/`,
      themes: `${getShikiPath()}/themes/`,
    },
  });

  return {
    react: {
      code: reactCode,
      html: highlighter.codeToHtml(reactCode, {
        lang: "tsx",
      }),
    },
    nextjs: {
      code: nextJsCode,
      html: highlighter.codeToHtml(nextJsCode, {
        lang: "tsx",
      }),
    },
    svelte: {
      code: svelteCode,
      html: highlighter.codeToHtml(svelteCode, {
        lang: "svelte"
      }),
    }
  };
}
