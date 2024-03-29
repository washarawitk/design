const { application } = require('express');
const Appointment = require('../models/Appointment');
const Hospital = require('../models/Hospital');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.getAppointments = async (req, res, next) => {
  let query;
  console.log(req.user);
  if (req.user.role !== 'admin') {
    query = Appointment.find({ user: req.user.id }).populate({
      path: 'hospital',
      select: 'name province tel',
    });
  } else {
    if (req.params.hospitalId) {
      console.log(req.params.hospitalId);
      query = Appointment.find({ hospital: req.params.hospitalId }).populate({
        path: 'hospital',
        select: 'name province tel',
      });
    } else {
      query = Appointment.find().populate({
        path: 'hospital',
        select: 'name province tel',
      });
    }
  }
  try {
    const appointments = await query;

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments,
    });
  } catch (err) {
    console.log(err.stack);
    return res.status(500).json({
      success: false,
      message: 'Cannot find Appointment',
    });
  }
};

exports.getAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id).populate({
      path: 'hospital',
      select: 'name description tel',
    });
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: `No appointment with the id of ${req.params.id}`,
      });
    }
    res.status(200).json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: 'Cannot find Appointment' });
  }
};

exports.addAppointment = async (req, res, next) => {
  try {
    req.body.hospital = req.params.hospitalId;
    const hospital = await Hospital.findById(req.params.hospitalId);

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: `No hospital with the id of  ${req.params.hospitalId}`,
      });
    }
    console.log(req.body);

    //add user id req

    req.body.user = req.user.id;
    const existedAppointments = await Appointment.find({ user: req.user.id });
    if (existedAppointments.length >= 3 && req.user.role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: `The  user with ID ${req.user.id}has already made 3 appointments`,
      });
    }

    const appointment = await Appointment.create(req.body);
    res.status(200).json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: 'Cannot  create Appointment' });
  }
};

//old update appointment
// exports.updateAppointment=async (req,res,next)=>{
//     try{
//         let appointment=await Appointment.findById(req.params.id);
//         if(!appointment){
//             return res.status(404).json({success:false,message: `No appointment with the id of ${req.params.id}`});
//         }

//         //make  sure appointment owner
//         if(appointment.user.toString()!==req.user.id && req.user.role !== 'admin'){
//             return res.status(401).json({success:false,message:`User ${req.user.id} is not authorized to update this appointment`});
//         }

//         appointment=await Appointment.findByIdAndUpdate(req.params.id,req.body,{
//             new:true,
//             runValidators:true
//         });

//         res.status(200).json({
//             success:true,
//             data: appointment
//         });
//     }catch(error){
//         console.log(error);
//         return res.status(500).json({success:false,message:'Cannot update Appointment'});
//     }
// }

//new update appointment **************************************************************************
exports.updateAppointment = async (req, res, next) => {
  let token;

  //get token
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: 'Not authorized to access this route' });
  }

  try {
    //get user
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decoded);
    req.user = await User.findById(decoded.id);

    // Make sure appointment owner or admin (check role)
    if (!(req.user.role === 'admin' || req.user.role === 'user')) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`,
      });
    }

    //get appointment
    let appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: `No appointment with the id of ${req.params.id}`,
      });
    }

    //update appoiment
    appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: appointment,
    });
  } catch (err) {
    console.log(err.stack);
    return res
      .status(500)
      .json({ success: false, message: 'Cannot update Appointment' });
  }
};

//old delete appointment
// exports.deleteAppointment = async (req, res, next) => {
//   try {
//     const appointment = await Appointment.findById(req.params.id);

//     if (!appointment) {
//       return res
//         .status(404)
//         .json({
//           success: false,
//           message: `No appointment with the id of ${req.params.id}`,
//         });
//     }
//     await appointment.deleteOne();

//     res.status(200).json({
//       success: true,
//       data: {},
//     });
//   } catch (error) {
//     console.log(error);
//     return res
//       .status(500)
//       .json({ success: false, message: 'Cannot delete Appointment' });
//   }
// };

//new delete appointment **************************************************************************
exports.deleteAppointment = async (req, res, next) => {
  let token;

  //get token
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: 'Not authorized to access this route' });
  }

  try {
    //get user
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decoded);
    req.user = await User.findById(decoded.id);

    // Make sure appointment owner or admin (check role)
    if (!(req.user.role === 'admin' || req.user.role === 'user')) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`,
      });
    }

    // get appoiment
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: `No appointment with the id of ${req.params.id}`,
      });
    }

    // delete appoiment
    await appointment.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    console.log(error.stack);
    return res
      .status(401)
      .json({ success: false, message: 'Not authorized to access this route' });
  }
};
