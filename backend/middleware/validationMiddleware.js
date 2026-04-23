import mongoose from "mongoose";

const createValidator = (validateFn) => (req, res, next) => {
  try {
    validateFn(req);
    next();
  } catch (error) {
    res.status(400);
    next(error);
  }
};

const ensureObject = (value, label) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${label} must be an object`);
  }
};

const validateAllowedFields = (payload, allowedFields) => {
  const unknownFields = Object.keys(payload).filter((field) => !allowedFields.includes(field));
  if (unknownFields.length) {
    throw new Error(`Unexpected field(s): ${unknownFields.join(", ")}`);
  }
};

const requireAtLeastOneField = (payload, allowedFields) => {
  const hasAnyField = allowedFields.some((field) => payload[field] !== undefined);
  if (!hasAnyField) {
    throw new Error(`At least one updatable field is required: ${allowedFields.join(", ")}`);
  }
};

const ensureObjectId = (value, label) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw new Error(`Invalid ${label}`);
  }
};

const ensureRequiredString = (payload, field, label, maxLength = 120) => {
  const value = payload[field];
  if (typeof value !== "string") {
    throw new Error(`${label} is required`);
  }

  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error(`${label} is required`);
  }

  if (trimmed.length > maxLength) {
    throw new Error(`${label} cannot exceed ${maxLength} characters`);
  }

  payload[field] = trimmed;
};

const ensureOptionalString = (payload, field, label, maxLength = 200) => {
  const value = payload[field];
  if (value === undefined) {
    return;
  }

  if (typeof value !== "string") {
    throw new Error(`${label} must be a string`);
  }

  const trimmed = value.trim();
  if (trimmed.length > maxLength) {
    throw new Error(`${label} cannot exceed ${maxLength} characters`);
  }

  payload[field] = trimmed;
};

const ensureOptionalEmail = (payload, field, label) => {
  const value = payload[field];
  if (value === undefined) {
    return;
  }

  if (typeof value !== "string") {
    throw new Error(`${label} must be a string`);
  }

  const normalized = value.trim().toLowerCase();
  if (!normalized) {
    payload[field] = "";
    return;
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(normalized)) {
    throw new Error(`${label} must be a valid email address`);
  }

  payload[field] = normalized;
};

const ensureOptionalPhone = (payload, field, label) => {
  const value = payload[field];
  if (value === undefined) {
    return;
  }

  if (typeof value !== "string") {
    throw new Error(`${label} must be a string`);
  }

  const trimmed = value.trim();
  if (!trimmed) {
    payload[field] = "";
    return;
  }

  const phonePattern = /^[0-9+()\-\s]{7,20}$/;
  if (!phonePattern.test(trimmed)) {
    throw new Error(`${label} must contain 7 to 20 valid phone characters`);
  }

  payload[field] = trimmed;
};

const ensureOptionalPhoneTenDigits = (payload, field, label) => {
  const value = payload[field];
  if (value === undefined) {
    return;
  }

  if (typeof value !== "string") {
    throw new Error(`${label} must be a string`);
  }

  const trimmed = value.trim();
  if (!trimmed) {
    payload[field] = "";
    return;
  }

  if (!/^\d{10}$/.test(trimmed)) {
    throw new Error(`${label} must be exactly 10 digits`);
  }

  payload[field] = trimmed;
};

const ensureEnum = (payload, field, allowed, label) => {
  const value = payload[field];
  if (value === undefined) {
    return;
  }

  if (typeof value !== "string") {
    throw new Error(`${label} must be a string`);
  }

  const trimmed = value.trim();
  if (!allowed.includes(trimmed)) {
    throw new Error(`${label} must be one of: ${allowed.join(", ")}`);
  }

  payload[field] = trimmed;
};

const ensureYear = (payload, field, label) => {
  const value = payload[field];
  if (value === undefined || value === "") {
    return;
  }

  const year = Number(value);
  if (!Number.isInteger(year) || year < 1900 || year > 2100) {
    throw new Error(`${label} must be a year between 1900 and 2100`);
  }

  payload[field] = year;
};

const parseAndValidateDateValue = (value, label) => {
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) {
      throw new Error(`${label} must be a valid date`);
    }
    return value;
  }

  if (typeof value !== "string") {
    throw new Error(`${label} must be a valid date`);
  }

  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error(`${label} must be a valid date`);
  }

  const dateOnlyPattern = /^(\d{4})-(\d{2})-(\d{2})$/;
  const dateOnlyMatch = trimmed.match(dateOnlyPattern);
  if (dateOnlyMatch) {
    const year = Number(dateOnlyMatch[1]);
    const month = Number(dateOnlyMatch[2]);
    const day = Number(dateOnlyMatch[3]);
    const parsed = new Date(Date.UTC(year, month - 1, day));

    const isSameDate =
      parsed.getUTCFullYear() === year &&
      parsed.getUTCMonth() + 1 === month &&
      parsed.getUTCDate() === day;

    if (!isSameDate) {
      throw new Error(`${label} must be a valid date`);
    }

    return trimmed;
  }

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`${label} must be a valid date`);
  }

  return trimmed;
};

const ensureDate = (payload, field, label) => {
  const value = payload[field];
  if (value === undefined) {
    return;
  }

  payload[field] = parseAndValidateDateValue(value, label);
};

const ensureRequiredDate = (payload, field, label) => {
  const value = payload[field];
  if (value === undefined || value === null || value === "") {
    throw new Error(`${label} is required`);
  }

  payload[field] = parseAndValidateDateValue(value, label);
};

const ensureOptionalTime = (payload, field, label) => {
  const value = payload[field];
  if (value === undefined) {
    return;
  }

  if (typeof value !== "string") {
    throw new Error(`${label} must be a string in HH:mm format`);
  }

  const trimmed = value.trim();
  if (!trimmed) {
    payload[field] = "";
    return;
  }

  const timePattern = /^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/;
  const match = trimmed.match(timePattern);
  if (!match) {
    throw new Error(`${label} must be in HH:mm format`);
  }

  payload[field] = `${match[1]}:${match[2]}`;
};

const formatDateToLocalYmd = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getCurrentLocalTimeHHmm = (offsetMinutes = 0) => {
  const now = new Date();
  now.setSeconds(0, 0);
  if (offsetMinutes) {
    now.setMinutes(now.getMinutes() + offsetMinutes);
  }
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
};

const parseScheduleDateToLocalDay = (value) => {
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) {
      throw new Error("scheduleDate must be a valid date");
    }

    return new Date(value.getFullYear(), value.getMonth(), value.getDate());
  }

  if (typeof value !== "string") {
    throw new Error("scheduleDate must be a valid date");
  }

  const trimmed = value.trim();
  const dateOnlyPattern = /^(\d{4})-(\d{2})-(\d{2})$/;
  const match = trimmed.match(dateOnlyPattern);

  if (match) {
    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const parsed = new Date(year, month - 1, day);

    const isSameDate =
      parsed.getFullYear() === year && parsed.getMonth() + 1 === month && parsed.getDate() === day;

    if (!isSameDate) {
      throw new Error("scheduleDate must be a valid date");
    }

    return parsed;
  }

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error("scheduleDate must be a valid date");
  }

  return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
};

const validateScheduleAgainstLocalDateTime = (payload) => {
  if (payload.scheduleDate === undefined) {
    return;
  }

  const scheduleDay = parseScheduleDateToLocalDay(payload.scheduleDate);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (scheduleDay < today) {
    throw new Error("scheduleDate cannot be in the past (local date)");
  }

  if (scheduleDay.getTime() === today.getTime() && payload.scheduleTime) {
    const [hours, minutes] = payload.scheduleTime.split(":").map(Number);
    const scheduleMinutes = hours * 60 + minutes;
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const allowedDelayMinutes = 1;

    if (scheduleMinutes + allowedDelayMinutes < currentMinutes) {
      throw new Error("scheduleTime cannot be in the past for today's schedule (local time)");
    }
  }

  payload.scheduleDate = formatDateToLocalYmd(scheduleDay);
};

const ensureArrayOfStrings = (payload, field, label) => {
  const value = payload[field];
  if (value === undefined) {
    return;
  }

  if (!Array.isArray(value)) {
    throw new Error(`${label} must be an array of strings`);
  }

  const normalized = value.map((item) => {
    if (typeof item !== "string") {
      throw new Error(`${label} must be an array of strings`);
    }
    return item.trim();
  });

  payload[field] = normalized;
};

const validateIdParam = createValidator((req) => {
  ensureObjectId(req.params.id, "id parameter");
});

const validateSocietyListQuery = createValidator((req) => {
  if (req.query.q !== undefined && typeof req.query.q !== "string") {
    throw new Error("q query must be a string");
  }

  if (req.query.type !== undefined) {
    const allowed = ["Sports", "Technical", "Cultural", "Community", "Other"];
    if (!allowed.includes(req.query.type)) {
      throw new Error(`type query must be one of: ${allowed.join(", ")}`);
    }
  }
});

const validateCreateSociety = createValidator((req) => {
  const allowedFields = [
    "name",
    "type",
    "description",
    "establishedYear",
    "president",
    "contactEmail",
    "phone",
    "status",
  ];

  ensureObject(req.body, "Request body");
  validateAllowedFields(req.body, allowedFields);

  ensureRequiredString(req.body, "name", "name", 120);
  ensureEnum(req.body, "type", ["Sports", "Technical", "Cultural", "Community", "Other"], "type");
  ensureOptionalString(req.body, "description", "description", 500);
  ensureYear(req.body, "establishedYear", "establishedYear");
  ensureOptionalString(req.body, "president", "president", 120);
  ensureOptionalEmail(req.body, "contactEmail", "contactEmail");
  ensureOptionalPhoneTenDigits(req.body, "phone", "phone");
  ensureEnum(req.body, "status", ["Active", "Inactive"], "status");
});

const validateUpdateSociety = createValidator((req) => {
  const allowedFields = [
    "name",
    "type",
    "description",
    "establishedYear",
    "president",
    "contactEmail",
    "phone",
    "status",
  ];

  ensureObject(req.body, "Request body");
  validateAllowedFields(req.body, allowedFields);
  requireAtLeastOneField(req.body, allowedFields);

  if (req.body.name !== undefined) {
    ensureRequiredString(req.body, "name", "name", 120);
  }
  ensureEnum(req.body, "type", ["Sports", "Technical", "Cultural", "Community", "Other"], "type");
  ensureOptionalString(req.body, "description", "description", 500);
  ensureYear(req.body, "establishedYear", "establishedYear");
  ensureOptionalString(req.body, "president", "president", 120);
  ensureOptionalEmail(req.body, "contactEmail", "contactEmail");
  ensureOptionalPhoneTenDigits(req.body, "phone", "phone");
  ensureEnum(req.body, "status", ["Active", "Inactive"], "status");
});

const validateMemberListQuery = createValidator((req) => {
  if (req.query.societyId !== undefined) {
    ensureObjectId(req.query.societyId, "societyId query parameter");
  }
});

const validateCreateMember = createValidator((req) => {
  const allowedFields = ["society", "fullName", "role", "email", "phone", "joinedOn"];

  ensureObject(req.body, "Request body");
  validateAllowedFields(req.body, allowedFields);

  if (req.body.society === undefined) {
    throw new Error("society is required");
  }
  ensureObjectId(req.body.society, "society");

  ensureRequiredString(req.body, "fullName", "fullName", 120);
  ensureEnum(req.body, "role", ["President", "Secretary", "Treasurer", "Member", "Coordinator"], "role");
  ensureOptionalEmail(req.body, "email", "email");
  ensureOptionalPhone(req.body, "phone", "phone");
  ensureDate(req.body, "joinedOn", "joinedOn");
});

const validateUpdateMember = createValidator((req) => {
  const allowedFields = ["society", "fullName", "role", "email", "phone", "joinedOn"];

  ensureObject(req.body, "Request body");
  validateAllowedFields(req.body, allowedFields);
  requireAtLeastOneField(req.body, allowedFields);

  if (req.body.society !== undefined) {
    ensureObjectId(req.body.society, "society");
  }
  if (req.body.fullName !== undefined) {
    ensureRequiredString(req.body, "fullName", "fullName", 120);
  }
  ensureEnum(req.body, "role", ["President", "Secretary", "Treasurer", "Member", "Coordinator"], "role");
  ensureOptionalEmail(req.body, "email", "email");
  ensureOptionalPhone(req.body, "phone", "phone");
  ensureDate(req.body, "joinedOn", "joinedOn");
});

const validateTeamListQuery = createValidator((req) => {
  if (req.query.societyId !== undefined) {
    ensureObjectId(req.query.societyId, "societyId query parameter");
  }
});

const validateCreateTeam = createValidator((req) => {
  const allowedFields = ["society", "name", "category", "captain", "coach", "photoUrl", "members", "achievements", "status", "contactEmail", "contactPhone", "rejectionReason"];

  ensureObject(req.body, "Request body");
  validateAllowedFields(req.body, allowedFields);

  if (req.body.society === undefined) {
    throw new Error("society is required");
  }
  ensureObjectId(req.body.society, "society");

  ensureRequiredString(req.body, "name", "name", 120);
  ensureOptionalString(req.body, "category", "category", 80);
  ensureOptionalString(req.body, "captain", "captain", 120);
  ensureOptionalString(req.body, "coach", "coach", 120);
  ensureOptionalString(req.body, "photoUrl", "photoUrl", 500);
  ensureArrayOfStrings(req.body, "members", "members");
  ensureArrayOfStrings(req.body, "achievements", "achievements");
  ensureOptionalEmail(req.body, "contactEmail", "contactEmail");
  ensureOptionalPhoneTenDigits(req.body, "contactPhone", "contactPhone");
  ensureOptionalString(req.body, "rejectionReason", "rejectionReason", 500);
});

const validateUpdateTeam = createValidator((req) => {
  const allowedFields = ["society", "name", "category", "captain", "coach", "photoUrl", "members", "achievements", "status", "contactEmail", "contactPhone", "rejectionReason"];

  ensureObject(req.body, "Request body");
  validateAllowedFields(req.body, allowedFields);
  requireAtLeastOneField(req.body, allowedFields);

  if (req.body.society !== undefined) {
    ensureObjectId(req.body.society, "society");
  }
  if (req.body.name !== undefined) {
    ensureRequiredString(req.body, "name", "name", 120);
  }
  ensureOptionalString(req.body, "category", "category", 80);
  ensureOptionalString(req.body, "captain", "captain", 120);
  ensureOptionalString(req.body, "coach", "coach", 120);
  ensureOptionalString(req.body, "photoUrl", "photoUrl", 500);
  ensureArrayOfStrings(req.body, "members", "members");
  ensureArrayOfStrings(req.body, "achievements", "achievements");
  ensureOptionalEmail(req.body, "contactEmail", "contactEmail");
  ensureOptionalPhoneTenDigits(req.body, "contactPhone", "contactPhone");
  ensureOptionalString(req.body, "rejectionReason", "rejectionReason", 500);
});

const validateTeamReview = createValidator((req) => {
  const allowedFields = ["status", "adminMessage"];

  ensureObject(req.body, "Request body");
  validateAllowedFields(req.body, allowedFields);

  if (req.body.status === undefined) {
    throw new Error("status is required");
  }

  ensureEnum(req.body, "status", ["active", "rejected"], "status");
  ensureOptionalString(req.body, "adminMessage", "adminMessage", 500);
});

const validateScheduleListQuery = createValidator((req) => {
  if (req.query.team !== undefined && typeof req.query.team !== "string") {
    throw new Error("team query must be a string");
  }

  if (req.query.status !== undefined) {
    const allowed = ["Planned", "Completed", "Cancelled"];
    if (!allowed.includes(req.query.status)) {
      throw new Error(`status query must be one of: ${allowed.join(", ")}`);
    }
  }

  if (req.query.month !== undefined) {
    const monthPattern = /^\d{4}-(0[1-9]|1[0-2])$/;
    if (!monthPattern.test(req.query.month)) {
      throw new Error("month query must follow YYYY-MM format");
    }
  }
});

const validateCreateSchedule = createValidator((req) => {
  const allowedFields = ["team", "eventName", "sportType", "scheduleDate", "scheduleTime", "venue", "status"];

  ensureObject(req.body, "Request body");
  validateAllowedFields(req.body, allowedFields);

  ensureRequiredString(req.body, "team", "team", 120);
  ensureRequiredString(req.body, "eventName", "eventName", 160);
  ensureOptionalString(req.body, "sportType", "sportType", 80);
  ensureRequiredDate(req.body, "scheduleDate", "scheduleDate");
  ensureOptionalTime(req.body, "scheduleTime", "scheduleTime");
  if (!req.body.scheduleTime) {
    req.body.scheduleTime = getCurrentLocalTimeHHmm(1);
  }
  validateScheduleAgainstLocalDateTime(req.body);
  ensureOptionalString(req.body, "venue", "venue", 160);
  ensureEnum(req.body, "status", ["Planned", "Completed", "Cancelled"], "status");
});

const validateUpdateSchedule = createValidator((req) => {
  const allowedFields = ["team", "eventName", "sportType", "scheduleDate", "scheduleTime", "venue", "status"];

  ensureObject(req.body, "Request body");
  validateAllowedFields(req.body, allowedFields);
  requireAtLeastOneField(req.body, allowedFields);

  if (req.body.team !== undefined) {
    ensureRequiredString(req.body, "team", "team", 120);
  }
  if (req.body.eventName !== undefined) {
    ensureRequiredString(req.body, "eventName", "eventName", 160);
  }
  ensureOptionalString(req.body, "sportType", "sportType", 80);
  ensureDate(req.body, "scheduleDate", "scheduleDate");
  ensureOptionalTime(req.body, "scheduleTime", "scheduleTime");
  validateScheduleAgainstLocalDateTime(req.body);
  ensureOptionalString(req.body, "venue", "venue", 160);
  ensureEnum(req.body, "status", ["Planned", "Completed", "Cancelled"], "status");
});

const ensurePassword = (payload, field, label) => {
  const value = payload[field];
  
  if (value === undefined || value === null || typeof value !== "string") {
    throw new Error(`${label} is required`);
  }

  if (value.length < 6) {
    throw new Error(`${label} must be at least 6 characters`);
  }

  if (value.length > 72) {
    throw new Error(`${label} cannot exceed 72 characters`);
  }
};

const validateRegister = createValidator((req) => {
  const allowedFields = ["name", "email", "password"];

  ensureObject(req.body, "Request body");
  validateAllowedFields(req.body, allowedFields);

  ensureRequiredString(req.body, "name", "name", 120);
  ensureOptionalEmail(req.body, "email", "email");

  if (!req.body.email) {
    throw new Error("email is required");
  }

  ensurePassword(req.body, "password", "password");
});

const validateLogin = createValidator((req) => {
  const allowedFields = ["email", "password"];

  ensureObject(req.body, "Request body");
  validateAllowedFields(req.body, allowedFields);

  ensureOptionalEmail(req.body, "email", "email");

  if (!req.body.email) {
    throw new Error("email is required");
  }

  ensurePassword(req.body, "password", "password");
});

export {
  validateIdParam,
  validateSocietyListQuery,
  validateCreateSociety,
  validateUpdateSociety,
  validateMemberListQuery,
  validateCreateMember,
  validateUpdateMember,
  validateTeamListQuery,
  validateCreateTeam,
  validateUpdateTeam,
  validateTeamReview,
  validateScheduleListQuery,
  validateCreateSchedule,
  validateUpdateSchedule,
  validateRegister,
  validateLogin,
};