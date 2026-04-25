const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const cron = require('node-cron');

// Configuration
const BACKUP_DIR = path.join(__dirname, '../../backups');

/**
 * Executes a full database backup
 * Requirement: Automated Backup
 */
exports.runBackup = () => {
    return new Promise((resolve, reject) => {
        if (!fs.existsSync(BACKUP_DIR)) {
            fs.mkdirSync(BACKUP_DIR, { recursive: true });
        }

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `ultra_enterprise_backup_${timestamp}.gz`;
        const filepath = path.join(BACKUP_DIR, filename);

        // Command for mongodump with compression
        const dbUrl = process.env.MONGO_URI;
        const cmd = `mongodump --uri="${dbUrl}" --archive="${filepath}" --gzip`;

        exec(cmd, (error, stdout, stderr) => {
            if (error) {
                console.error(`Backup Error: ${error.message}`);
                return reject(error);
            }
            console.log(`Backup Successful: ${filename}`);
            resolve({ filename, size: fs.statSync(filepath).size });
        });
    });
};

/**
 * Restores a specific backup file
 * Requirement: Restore System
 */
exports.runRestore = (filename) => {
    return new Promise((resolve, reject) => {
        const filepath = path.join(BACKUP_DIR, filename);
        
        if (!fs.existsSync(filepath)) {
            return reject(new Error('Backup file not found.'));
        }

        const dbUrl = process.env.MONGO_URI;
        const cmd = `mongorestore --uri="${dbUrl}" --archive="${filepath}" --gzip --drop`;

        exec(cmd, (error, stdout, stderr) => {
            if (error) {
                console.error(`Restore Error: ${error.message}`);
                return reject(error);
            }
            console.log(`System Restored from: ${filename}`);
            resolve(true);
        });
    });
};

/**
 * List available backups
 */
exports.listBackups = () => {
    if (!fs.existsSync(BACKUP_DIR)) return [];
    return fs.readdirSync(BACKUP_DIR)
        .filter(file => file.endsWith('.gz'))
        .map(file => ({
            filename: file,
            date: fs.statSync(path.join(BACKUP_DIR, file)).mtime
        }))
        .sort((a, b) => b.date - a.date);
};
