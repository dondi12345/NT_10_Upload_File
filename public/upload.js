var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
var uploadForm = document.getElementById('uploadForm');
var statusParagraph = document.getElementById('status');
var fileList = document.getElementById('fileList');
var deleteAllButton = document.getElementById('deleteAllButton');
var progressContainer = document.getElementById('progressContainer');
var progressBar = document.getElementById('progressBar');
// npx tsc public/upload.ts --outFile public/upload.js
// Function to display uploaded files with delete buttons
function renderFileList(files, folderName) {
    fileList.innerHTML = ''; // Clear the list
    files.forEach(function (file) {
        var listItem = document.createElement('li');
        listItem.textContent = "".concat(file.filename, " (").concat(file.size, ")");
        var deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.addEventListener('click', function () { return deleteFile(folderName, file.filename); });
        listItem.appendChild(deleteButton);
        fileList.appendChild(listItem);
        ;
    });
}
// Extract folder name from URL path
var folderName = window.location.pathname.split('/').filter(Boolean).pop() || 'default';
function fetchFiles() {
    return __awaiter(this, void 0, void 0, function () {
        var response, result, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, fetch("/files/".concat(folderName))];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    result = _a.sent();
                    if (response.ok) {
                        renderFileList(result.files, folderName);
                    }
                    else {
                        statusParagraph.textContent = "Error: ".concat(result.message);
                    }
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    statusParagraph.textContent = "Failed to fetch files: ".concat(error_1);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
document.addEventListener('DOMContentLoaded', fetchFiles);
// Handle multiple file uploads with progress tracking
uploadForm.addEventListener('submit', function (event) { return __awaiter(_this, void 0, void 0, function () {
    var fileInput, files, formData, response, result, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                event.preventDefault();
                fileInput = document.getElementById('fileInput');
                files = fileInput.files;
                if (!files || files.length === 0) {
                    statusParagraph.textContent = 'Please select at least one file!';
                    return [2 /*return*/];
                }
                formData = new FormData();
                Array.from(files).forEach(function (file) { return formData.append('files', file); });
                _a.label = 1;
            case 1:
                _a.trys.push([1, 4, , 5]);
                return [4 /*yield*/, fetch("/upload/".concat(folderName), {
                        method: 'POST',
                        body: formData
                    })];
            case 2:
                response = _a.sent();
                return [4 /*yield*/, response.json()];
            case 3:
                result = _a.sent();
                if (response.ok) {
                    statusParagraph.textContent = 'Files uploaded successfully!';
                    fetchFiles();
                }
                else {
                    statusParagraph.textContent = "Error: ".concat(result.message);
                }
                return [3 /*break*/, 5];
            case 4:
                error_2 = _a.sent();
                statusParagraph.textContent = "Upload failed: ".concat(error_2);
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); });
// Upload files with progress tracking using XMLHttpRequest
function uploadFilesWithProgress(formData) {
    return new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open('POST', "/upload/".concat(folderName), true);
        // Track the upload progress
        xhr.upload.onprogress = function (event) {
            if (event.lengthComputable) {
                var percentComplete = Math.round((event.loaded / event.total) * 100);
                progressBar.style.width = "".concat(percentComplete, "%");
                progressBar.textContent = "".concat(percentComplete, "%");
            }
        };
        // Show progress bar when upload starts
        xhr.onloadstart = function () {
            progressContainer.style.display = 'block';
            progressBar.style.width = '0%';
            progressBar.textContent = '0%';
        };
        // Hide progress bar and resolve when upload is complete
        xhr.onload = function () {
            if (xhr.status === 200) {
                var result = JSON.parse(xhr.responseText);
                statusParagraph.textContent = 'Files uploaded successfully!';
                renderFileList(result.files, folderName);
                resolve();
            }
            else {
                reject("Error: ".concat(xhr.statusText));
            }
            progressContainer.style.display = 'none';
        };
        // Handle errors during upload
        xhr.onerror = function () {
            reject('Upload failed due to a network error.');
            progressContainer.style.display = 'none';
        };
        xhr.send(formData);
    });
}
// Function to delete a single file
function deleteFile(folderName, filename) {
    return __awaiter(this, void 0, void 0, function () {
        var response, result, listItem, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, fetch("/delete/".concat(folderName, "/").concat(filename), {
                            method: 'DELETE',
                        })];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    result = _a.sent();
                    if (response.ok) {
                        statusParagraph.textContent = result.message;
                        listItem = Array.from(fileList.children).find(function (item) { var _a; return (_a = item.textContent) === null || _a === void 0 ? void 0 : _a.includes(filename); });
                        if (listItem)
                            fileList.removeChild(listItem);
                    }
                    else {
                        statusParagraph.textContent = "Error: ".concat(result.message);
                    }
                    return [3 /*break*/, 4];
                case 3:
                    error_3 = _a.sent();
                    statusParagraph.textContent = "Delete failed: ".concat(error_3);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
// Function to delete all files
deleteAllButton.addEventListener('click', function () { return __awaiter(_this, void 0, void 0, function () {
    var response, result, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                return [4 /*yield*/, fetch("/delete-all/".concat(folderName), {
                        method: 'DELETE',
                    })];
            case 1:
                response = _a.sent();
                return [4 /*yield*/, response.json()];
            case 2:
                result = _a.sent();
                if (response.ok) {
                    statusParagraph.textContent = result.message;
                    fileList.innerHTML = ''; // Clear the file list
                }
                else {
                    statusParagraph.textContent = "Error: ".concat(result.message);
                }
                return [3 /*break*/, 4];
            case 3:
                error_4 = _a.sent();
                statusParagraph.textContent = "Delete all failed: ".concat(error_4);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
