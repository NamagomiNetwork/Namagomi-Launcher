import fs from "fs";

const crypto = require('crypto')

export async function checkSum(contents: string, hash: string, algorithm: string): Promise<boolean> {
    return calculateHash(contents, algorithm).then(hashValue => {
        return hashValue === hash
    }).catch(err => {
        console.error(err)
        return false
    })
}

function calculateHash(filePath: string, algorithm: string) {
    return new Promise((resolve, reject) => {

        const shasum = crypto.createHash(algorithm);
        let stream = fs.createReadStream(filePath);
        stream.on('data', chunk => shasum.update(chunk));
        stream.on('close', (_: any) => resolve(shasum.digest('hex')));
        stream.on('error', (err: any) => reject(err));
    });
}