const { google } = require('googleapis');
const path = require('path');
const { Readable } = require('stream');

class GoogleDriveService {
  constructor() {
    this.GOOGLE_DRIVE_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID;
    
    const auth = new google.auth.GoogleAuth({
      keyFile: path.join(__dirname, '../config/doctracking-441710-9cd640e20564.json'),
      scopes: ['https://www.googleapis.com/auth/drive']
    });

    this.driveService = google.drive({ version: 'v3', auth });
  }

  async uploadFile(fileObject) {
    try {
      console.log('Attempting to upload file:', fileObject.originalname);
      
      const fileMetadata = {
        name: fileObject.originalname,
        parents: [this.GOOGLE_DRIVE_FOLDER_ID]
      };

      const media = {
        mimeType: fileObject.mimetype,
        body: Readable.from(fileObject.buffer)
      };

      const response = await this.driveService.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id,webViewLink'
      });

      // Make the file publicly accessible
      await this.driveService.permissions.create({
        fileId: response.data.id,
        requestBody: {
          role: 'reader',
          type: 'anyone'
        }
      });

      // Create direct link
      const directLink = `https://drive.google.com/uc?export=view&id=${response.data.id}`;

      console.log('File uploaded successfully:', { ...response.data, directLink });
      return { ...response.data, directLink };
    } catch (error) {
      console.error('Error uploading to Google Drive:', error);
      throw error;
    }
  }

  async deleteFile(fileId) {
    try {
      await this.driveService.files.delete({
        fileId: fileId
      });
      return true;
    } catch (error) {
      console.error('Error deleting file from Google Drive:', error);
      throw error;
    }
  }
}

module.exports = GoogleDriveService; 