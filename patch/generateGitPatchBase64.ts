import c3prSH3 from "../src/c3prSH3";

const fs = require('fs');

export interface FileChanges {
    added: string[];
    modified: string[];
    renamed: {from: string, to: string}[];
    deleted: string[];
}
export interface PatchDiffBase64 {
    hexBase64: string;
    plain: string;
    header: string;
    footer: string;
}
export interface GitPatchBase64 {
    files: FileChanges;
    patch: PatchDiffBase64;
}

function extractFileChanges(fileNames: string):FileChanges {
    return fileNames.trim().split('\n').filter(f => f).reduce((previousValue: FileChanges, currentValue) => {
        switch (currentValue[0]) {
            case 'A':
                previousValue.added.push(currentValue.split(/A +/)[1]);
                break;
            case 'M':
                previousValue.modified.push(currentValue.split(/M +/)[1]);
                break;
            case 'R': {
                let [from, to] = currentValue.split(/R +/)[1].split(' -> ');
                previousValue.renamed.push({from, to});
                break;
            }
            case 'D':
                previousValue.deleted.push(currentValue.split(/D +/)[1]);
                break;
            default:
                previousValue.modified.push(currentValue);
        }
        return previousValue;
    }, {added: [], modified: [], renamed: [], deleted: []});
}

export const EMPTY_PATCH = () => ({files: {added: [], modified: [], renamed: [], deleted: []}, patch: {hexBase64: '', plain: '', header: '', footer: ''}});

async function generateGitPatchBase64({cloneFolder, gitUserName, gitUserEmail, commitMessage}, c3prLOG5): Promise<GitPatchBase64> {
    c3prLOG5 = c3prLOG5({caller_name: 'generateGitPatchBase64'});

    await c3prSH3(`git add -A`, {cwd: cloneFolder}, {}, c3prLOG5);

    const diffFilePath = `${cloneFolder}/1`;

    // let fileNames = await c3prSH3(`git diff --staged --name-only`, {cwd: cloneFolder}, {lcid, sha, euuid});
    let fileNames = await c3prSH3(`git status --short`, {cwd: cloneFolder}, {}, c3prLOG5);

    if (fileNames.trim() === '') {
        return EMPTY_PATCH();
    }

    // await c3prSH3(`git diff --staged --ignore-space-change > changes.patch`, {cwd: cloneFolder}, {lcid, sha, euuid});
    // console.log('\n\n\n\n\n\n');
    // const changes = fs.readFileSync(`${cloneFolder}/changes.patch`, 'utf8');
    // console.log(changes);
    // console.log('\n\n\n\n\n\n');

    // ADD and COMMIT CHANGES
    const userNameNoQuotes = gitUserName.replace(/'/g, '');
    const userEmailNoQuotes = gitUserEmail.replace(/'/g, '');
    await c3prSH3(`git -c user.name='${userNameNoQuotes}' -c user.email='${userEmailNoQuotes}' commit -m "${commitMessage.replace(/"/g, '\\"')}"`, {cwd: cloneFolder}, {}, c3prLOG5);

    await c3prSH3(`git format-patch --ignore-space-at-eol --numbered-files -n -1 HEAD`, {cwd: cloneFolder}, {}, c3prLOG5);

    const plain = fs.readFileSync(diffFilePath, 'utf8');

    // this hex thing is an attempt to convert the file to an string without messing up the encoding
    // const diffViaFile = Buffer.from(fs.readFileSync(diffFilePath, 'utf8')).toString('base64');
    const diffViaFile = Buffer.from(fs.readFileSync(diffFilePath, 'hex'), 'hex').toString('base64');
    const [header, footer] = plain.match(/^[\s\S]*?---|--\s+[\w\d.]+\s+$/g);
    // const [header, footer] = plain.match(/^[\s\S]*?(?=\ndiff)|--\s+[\w\d.]+\s+$/g);
    const files = extractFileChanges(fileNames);

    return {files, patch: {hexBase64: diffViaFile, plain, header, footer}};
}

// noinspection JSUnusedGlobalSymbols
export default generateGitPatchBase64;