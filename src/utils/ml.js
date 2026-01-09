/**
 * ML helper for invoking the Python SSIM service
 */

const { exec } = require('child_process');
const path = require('path');

/**
 * Run ML verification service
 * @param {string} capturedPhotoPath
 * @param {string} registeredPhotoPath
 * @returns {Promise<{success:boolean,confidence_score:number,is_match:boolean,error?:string}>}
 */
function runVerification(capturedPhotoPath, registeredPhotoPath) {
    return new Promise((resolve) => {
        const mlServicePath = path.join(__dirname, '..', 'ml_service.py');
        const command = `python3 "${mlServicePath}" "${capturedPhotoPath}" "${registeredPhotoPath}"`;

        exec(command, (error, stdout) => {
            if (error) {
                return resolve({
                    success: false,
                    confidence_score: 0,
                    is_match: false,
                    error: error.message
                });
            }

            try {
                const result = JSON.parse(stdout);
                // Normalize shape in case Python returns strings
                return resolve({
                    success: Boolean(result.success),
                    confidence_score: Number(result.confidence_score) || 0,
                    is_match: Boolean(result.is_match),
                    error: result.error
                });
            } catch (parseError) {
                return resolve({
                    success: false,
                    confidence_score: 0,
                    is_match: false,
                    error: 'Failed to parse ML service response'
                });
            }
        });
    });
}

module.exports = {
    runVerification
};
