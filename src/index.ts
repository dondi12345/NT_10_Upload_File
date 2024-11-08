import express, { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
require('dotenv').config();

const app = express();
const PORT = process.env.API_PORT;
const ProjectName = process.env.ProjectName
const uploadDir = path.join(__dirname, '../uploads');

// Basic authentication middleware
const basicAuth = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        res.setHeader('WWW-Authenticate', 'Basic');
        res.status(401).json({ message: 'Authentication required' });
        return
    }

    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [username, password] = credentials.split(':');

    // Replace with your own authentication logic
    const validUsername = 'admin';
    const validPassword = 'password';

    if (username === validUsername && password === validPassword) {
        next();
    } else {
        res.status(401).json({ message: 'Invalid credentials' });
        return
    }
};

// Configure multer storage
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         const folderName = req.body.folderName || 'default';
//         const folderPath = path.join(uploadDir, folderName);

//         // Create the folder if it doesn't exist
//         if (!fs.existsSync(folderPath)) {
//             fs.mkdirSync(folderPath, { recursive: true });
//         }

//         cb(null, folderPath);
//     },
//     filename: (req, file, cb) => {
//         const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//         const extension = path.extname(file.originalname);
//         cb(null, file.fieldname + '-' + uniqueSuffix + extension);
//     }
// });

// const upload = multer({ storage: storage });

app.use(express.json());

// Apply the authentication middleware to protected routes
app.use('/home', basicAuth);
app.use('/upload', basicAuth);
app.use('/files', basicAuth);
app.use('/delete', basicAuth);
app.use('/create-folder', basicAuth);

app.use(express.static('public'));
app.use(express.static('uploads'));

fs.readdir(uploadDir, { withFileTypes: true }, (err, files) => {
    const folders = files.filter(dirent => dirent.isDirectory()).map(dirent => dirent.name);
    for (let index = 0; index < folders.length; index++) {
        app.use(`/${ProjectName}`, express.static('uploads/' + folders[index]));
    }
});

app.get('/home', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/manager_page.html'));
});

app.get('/upload_file/:folder_name', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Handle multiple file uploads
app.post('/upload/:folder_name', (req, res) => {
    const { folder_name } = req.params;
    const folderPath = path.join(uploadDir, folder_name as string);

    console.log('folderPath', folderPath);

    // Create the folder if it doesn't exist
    // if (!fs.existsSync(folderPath)) {
    //     fs.mkdirSync(folderPath, { recursive: true });
    // }

    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, folderPath);
        },
        filename: (req, file, cb) => {
            cb(null, file.originalname);
        }
    });

    const upload = multer({ storage: storage }).array('files');

    upload(req, res, (err) => {
        if (err) {
            return res.status(500).json({ message: 'File upload failed!' });
        }
        const uploadedFiles = (req.files as Express.Multer.File[]).map(file => file.filename);
        res.status(200).json({ message: 'Files uploaded successfully!', files: uploadedFiles });
    });
});

// Utility function to format file sizes
function formatFileSize(bytes: number): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Byte';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i];
}
// Get list of files
app.get('/files/:folder_name', (req: Request, res: Response) => {
    const { folder_name } = req.params;
    const folderPath = path.join(uploadDir, folder_name as string);

    console.log('folderPath', folderPath);

    // Create the folder if it doesn't exist
    // if (!fs.existsSync(folderPath)) {
    //     fs.mkdirSync(folderPath, { recursive: true });
    // }

    fs.readdir(folderPath, (err, files) => {
        if (err) {
            return res.status(500).json({ message: 'Failed to read directory!' });
        }

        const fileDetails = files.map((filename) => {
            const filePath = path.join(folderPath, filename);
            const stats = fs.statSync(filePath);
            return { filename, size: formatFileSize(stats.size) };
        });

        res.status(200).json({ files: fileDetails });
    });
});

// Handle file deletion
app.delete('/delete/:folderName/:filename', (req, res) => {
    const { folderName, filename } = req.params;
    const filePath = path.join(uploadDir, folderName, filename);

    fs.unlink(filePath, (err) => {
        if (err) {
            return res.status(500).json({ message: 'Failed to delete file!' });
        }
        res.status(200).json({ message: 'File deleted successfully!' });
    });
});

// Handle deleting all files
app.delete('/delete-all/:folderName', (req, res) => {
    const { folderName } = req.params;
    const filePath = path.join(uploadDir, folderName);
    fs.readdir(filePath, (err, files) => {
        if (err) return res.status(500).json({ message: 'Failed to read directory!' });

        // Delete all files in the directory
        files.forEach((file) => {
            fs.unlink(path.join(filePath, file), (unlinkErr) => {
                if (unlinkErr) console.error(`Failed to delete: ${file}`);
            });
        });

        res.status(200).json({ message: 'All files deleted successfully!' });
    });
});

// Get list of folders
app.get('/folders', (req: Request, res: Response) => {
    fs.readdir(uploadDir, { withFileTypes: true }, (err, files) => {
        if (err) {
            return res.status(500).json({ message: 'Failed to read directory!' });
        }

        const folders = files.filter(dirent => dirent.isDirectory()).map(dirent => dirent.name);
        res.status(200).json({ folders });
    });
});

// Handle folder creation
app.post('/create-folder', (req: Request, res: Response) => {
    const folderName = req.body.folderName;
    const folderPath = path.join(uploadDir, folderName);
    app.use(`/${ProjectName}`, express.static('uploads/' + folderName));
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
        res.status(200).json({ message: 'Folder created successfully!' });
    } else {
        res.status(400).json({ message: 'Folder already exists!' });
    }
});


// Handle folder deletion
app.delete('/delete-folder/:folderName', (req: Request, res: Response) => {
    const { folderName } = req.params;
    const folderPath = path.join(uploadDir, folderName);

    if (fs.existsSync(folderPath)) {
        fs.rmdirSync(folderPath, { recursive: true });
        res.status(200).json({ message: 'Folder deleted successfully!' });
    } else {
        res.status(400).json({ message: 'Folder does not exist!' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});