import multer from 'multer';
import express from 'express';
import { isAuth } from '../utils.js';
import {uploadFile} from '../s3.js';
import fs from 'fs';
import util from 'util';

const uploadRouter = express.Router();

const unlinkFile = util.promisify(fs.unlink);

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename(req, file, cb) {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});

const upload = multer({ storage });

uploadRouter.post('/', isAuth, upload.single('image'), async (req, res) => {

  const file=req.file;
  console.log(file);
  const result=await uploadFile(file);
  await unlinkFile(file.path);
  console.log(result);
  // const description=req.body.description;

  res.send(`/images/${result.Key}`);

  // let filePath=req.file.path;
  // filePath=filePath.replace("\\","/");
  // res.send(`/${filePath}`);
});

export default uploadRouter;
