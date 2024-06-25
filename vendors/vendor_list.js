const ipgeolocation = require('../vendors/ipgeolocation/convert')
const ipapi = require('../vendors/ipapi/convert')

const ServiceError = require("../error/service_error");

// List of vendors in the priority order they should be used
const vendorList = [
    ipgeolocation.convert,
    ipapi.convert
];

// Return the count / number of vendors available
exports.getVendorCount = function () {
    return vendorList.length;
}

// Return to the caller the vendor function at this index position in the list
exports.getVendor = function (index) {
    if (index < vendorList.length) {
        return vendorList[index];
    }

    throw new ServiceError('No vendor at this index / priority');
}