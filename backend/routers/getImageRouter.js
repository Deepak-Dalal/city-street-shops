import express from 'express';
import {getFileStream} from '../s3.js';
const ImageRouter = express.Router();

ImageRouter.get('/:key', (req, res) => {
    console.log(req.params);
    const key = req.params.key;
    const readStream = getFileStream(key);
    if(readStream) {
        readStream.createReadStream().on('error', e => {
            console.log(e);
            res.status(404).send("Image not found");
        }).pipe(res);
    }
})

export default ImageRouter;