const express  = require('express');
const { isMongoConnected, loadStore, saveStore } = require('../config/store');
const { protect, authorize } = require('../middleware/auth');
const router = express.Router();
router.use(protect, authorize('admin'));

router.get('/', async (req, res) => {
  try {
    if (isMongoConnected()) {
      const User=require('../models/User');
      const users=await User.find({}).select('-password').sort({createdAt:-1});
      return res.json({success:true,data:users});
    }
    const users=loadStore().users.map(({password:_,...u})=>u);
    res.json({success:true,data:users});
  } catch(e) { res.status(500).json({success:false,error:e.message}); }
});

router.put('/:id/toggle', async (req, res) => {
  try {
    if (isMongoConnected()) {
      const User=require('../models/User');
      const u=await User.findById(req.params.id);
      if(!u) return res.status(404).json({success:false,error:'Not found'});
      u.isActive=!u.isActive; await u.save({validateBeforeSave:false});
      return res.json({success:true,data:{isActive:u.isActive}});
    }
    const store=loadStore();
    const u=store.users.find(u=>u._id===req.params.id);
    if(!u) return res.status(404).json({success:false,error:'Not found'});
    u.isActive=!u.isActive; saveStore();
    res.json({success:true,data:{isActive:u.isActive}});
  } catch(e) { res.status(500).json({success:false,error:e.message}); }
});

router.delete('/:id', async (req, res) => {
  try {
    if (req.params.id===req.user._id) return res.status(400).json({success:false,error:'Cannot delete yourself'});
    if (isMongoConnected()) {
      const User=require('../models/User');
      await User.findByIdAndDelete(req.params.id);
      return res.json({success:true,data:{deleted:true}});
    }
    const store=loadStore();
    const i=store.users.findIndex(u=>u._id===req.params.id);
    if(i===-1) return res.status(404).json({success:false,error:'Not found'});
    store.users.splice(i,1); saveStore();
    res.json({success:true,data:{deleted:true}});
  } catch(e) { res.status(500).json({success:false,error:e.message}); }
});

module.exports = router;
