import express from 'express'
import studentController from '../Controllers/StudentController.js'
import upload from '../multerConfig/StorageConfig.js'
const router = express.Router()

router.get('/',studentController.getAllDoc)
router.get('/userexport',studentController.userExport)
router.post('/',upload.single("user_profile"),studentController.createDoc)
router.get('/edit/:id',studentController.editDoc)
router.post('/update/:id',upload.single("user_profile"),studentController.updateDocById)
router.post('/delete/:id',studentController.deleteDocById)
router.put('/status/:id',studentController.statusChange)

export default router;