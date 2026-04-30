import alfy from 'alfy';
import { fetch, getProjectFilePath, inputMatchesData } from './lib/utils.mjs';

async function main() {
  try {
    const files = getProjectFilePath();
    // console.log(`[info] Using files: ${files}`);
    // alfy.log(`[info] Using files: ${files}`);

    let projects = await fetch(files, {});

    if (alfy.input) {
      projects = inputMatchesData(projects, alfy.input, ['title', 'subtitle']);
    }

    // alfy.log(`[info] Found ${projects.length} projects`);
    // console.log(`[info] Found ${projects.length} projects`);

    if (projects.length === 0) {
      alfy.output([
        {
          title: 'No projects found',
        },
      ]);
    } else {
      const formatted = projects.map((p) => ({
        title: decodeURIComponent(p.title),
        subtitle: decodeURIComponent(p.subtitle),
        // icon: p.icon,
        arg: p.folderUri,
        uid: p.uid,
      }));

      // console.log(`[info] Outputting projects:`, formatted);

      alfy.output(formatted);
    }
  } catch (err) {
    alfy.error(`[error] ${err}`);
    // console.error(`[error] ${err}`);
    throw err;
  }
}

main();
