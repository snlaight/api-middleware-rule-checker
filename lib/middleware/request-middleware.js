import rules from "./rules.json";

/**
 * Function that finds the corresponding rule to the request.
 * @param(request) Express request object that is used to pass the requested URL.
 */
export const findMatchingRule = (request) => {
  const foundRoute = rules.paths[request.originalUrl];
  const rule = foundRoute && foundRoute[request.method.toLowerCase()];

  return rule;
};

/**
 * Main middleware function that makes full use of Express request, response, next methods.
 * @param {Request} request Express request object
 * @param {Response} response Express response object
 * @param {Next} next Express next method
 */

export const checkAgainstRules = (request, response, next) => {
  const bodyRequest = request.body;
  const rule = findMatchingRule(request);

  if (!rule) {
    return next({
      message: "Page not found.",
      statusCode: 404,
    });
  }

  if (request.method === "GET") {
    return next();
  }
  const foundParameters = rule.parameters[0].schema.properties;
  const { isValid, errors } = validateRequestParameters(
    bodyRequest,
    foundParameters
  );

  if (isValid) {
    return next();
  }

  next({
    success: isValid,
    errors,
    statusCode: 400,
  });
};

/**
 * Function to validate the request parameters before
 * handing it off to app middleware
 * @param {Object} body Express request body
 * @param {Object} parameters Rule parameters from rules.json
 */

const validateRequestParameters = (body, parameters) => {
  const bodyClone = { ...body };
  let errors = [];

  // Check for the required parameters
  Object.keys(parameters).forEach((paramName) => {
    parameters;
    // TODO validate body parameter types
    if (!bodyClone[paramName]) {
      errors.push({
        field: paramName,
        message: "Field is missing.",
        code: "MISSING_PARAMETER",
      });
    } else {
      delete bodyClone[paramName];
    }
  });

  // Iterate the fields that are additional, but not needed
  Object.keys(bodyClone).forEach((fieldName) => {
    errors.push({
      field: fieldName,
      message: "Field is not needed.",
      code: "NOT_NEEDED_PARAMETER",
    });
  });

  const isValid = errors.length === 0;

  isValid
    ? console.log("Request parameter properties match !")
    : console.error("request parameter properties don't match", errors);

  return {
    isValid,
    errors,
  };
};
