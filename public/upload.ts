const uploadForm = document.getElementById('uploadForm') as HTMLFormElement;
const statusParagraph = document.getElementById('status') as HTMLParagraphElement;
const fileList = document.getElementById('fileList') as HTMLUListElement;
const deleteAllButton = document.getElementById('deleteAllButton') as HTMLButtonElement;
const progressContainer = document.getElementById('progressContainer') as HTMLDivElement;
const progressBar = document.getElementById('progressBar') as HTMLDivElement;

// npx tsc public/upload.ts --outFile public/upload.js

// Function to display uploaded files with delete buttons
function renderFileList(files, folderName) {
    fileList.innerHTML = ''; // Clear the list
    files.forEach((file) => {
        const listItem = document.createElement('li');
        listItem.textContent = `${file.filename} (${file.size})`;
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.addEventListener('click', () => deleteFile(folderName, file.filename));
        listItem.appendChild(deleteButton);
        fileList.appendChild(listItem);;
    });
}

// Extract folder name from URL path
const folderName = window.location.pathname.split('/').filter(Boolean).pop() || 'default';

async function fetchFiles() {
    try {
        const response = await fetch(`/files/${folderName}`);
        const result = await response.json();
        if (response.ok) {
            renderFileList(result.files, folderName);
        } else {
            statusParagraph.textContent = `Error: ${result.message}`;
        }
    } catch (error) {
        statusParagraph.textContent = `Failed to fetch files: ${error}`;
    }
}

document.addEventListener('DOMContentLoaded', fetchFiles);

// Handle multiple file uploads with progress tracking
uploadForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    const files = fileInput.files;

    if (!files || files.length === 0) {
        statusParagraph.textContent = 'Please select at least one file!';
        return;
    }

    const formData = new FormData();
    Array.from(files).forEach((file) => formData.append('files', file));
    uploadFilesWithProgress(formData);
    // try {
    //     const response = await fetch(`/upload/${folderName}`, {
    //         method: 'POST',
    //         body: formData
    //     });
    //     const result = await response.json();
    //     if (response.ok) {
    //         statusParagraph.textContent = 'Files uploaded successfully!';
    //         fetchFiles();
    //     } else {
    //         statusParagraph.textContent = `Error: ${result.message}`;
    //     }
    // } catch (error) {
    //     statusParagraph.textContent = `Upload failed: ${error}`;
    // }
});

// Upload files with progress tracking using XMLHttpRequest
function uploadFilesWithProgress(formData: FormData) {
    return new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.open('POST', `/upload/${folderName}`, true);

        // Track the upload progress
        xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
                const percentComplete = Math.round((event.loaded / event.total) * 100);
                progressBar.style.width = `${percentComplete}%`;
                progressBar.textContent = `${percentComplete}%`;
            }
        };

        // Show progress bar when upload starts
        xhr.onloadstart = () => {
            progressContainer.style.display = 'block';
            progressBar.style.width = '0%';
            progressBar.textContent = '0%';
        };

        // Hide progress bar and resolve when upload is complete
        xhr.onload = () => {
            if (xhr.status === 200) {
                const result = JSON.parse(xhr.responseText);
                statusParagraph.textContent = 'Files uploaded successfully!';
                fetchFiles();
                resolve();
            } else {
                reject(`Error: ${xhr.statusText}`);
            }
            progressContainer.style.display = 'none';
        };

        // Handle errors during upload
        xhr.onerror = () => {
            reject('Upload failed due to a network error.');
            progressContainer.style.display = 'none';
        };

        xhr.send(formData);
    });
}

// Function to delete a single file
async function deleteFile(folderName, filename) {
    try {
        const response = await fetch(`/delete/${folderName}/${filename}`, {
            method: 'DELETE',
        });

        const result = await response.json();
        if (response.ok) {
            statusParagraph.textContent = result.message;
            const listItem = Array.from(fileList.children).find(
                (item) => item.textContent?.includes(filename)
            );
            if (listItem) fileList.removeChild(listItem);
        } else {
            statusParagraph.textContent = `Error: ${result.message}`;
        }
    } catch (error) {
        statusParagraph.textContent = `Delete failed: ${error}`;
    }
}

// Function to delete all files
deleteAllButton.addEventListener('click', async () => {
    try {
        const response = await fetch(`/delete-all/${folderName}`, {
            method: 'DELETE',
        });

        const result = await response.json();
        if (response.ok) {
            statusParagraph.textContent = result.message;
            fileList.innerHTML = ''; // Clear the file list
        } else {
            statusParagraph.textContent = `Error: ${result.message}`;
        }
    } catch (error) {
        statusParagraph.textContent = `Delete all failed: ${error}`;
    }
});
