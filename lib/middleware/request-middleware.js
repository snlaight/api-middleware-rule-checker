import rules from "./rules.json";

/**
 * Finds the matching rule for the given request.
 * @param request - The request to find the matching rule for.
 * @returns The matching rule, or undefined if no matching rule was found.
 */
export const findMatchingRule = (request) => {
  const foundRoute = rules.paths[request.originalUrl];
  const rule = foundRoute && foundRoute[request.method.toLowerCase()];

  return rule;
};

/**
 * Checks the request against the rules and returns a promise that resolves to the matching rule for the given path and method.
 * @param request - The request object.
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
 * Validates the request parameters against the expected parameters.
 * @param body - The request body.
 * @param parameters - The expected parameters.
 * @returns A boolean indicating whether the request parameters are valid.
 */
const validateRequestParameters = (body, parameters) => {
  const bodyClone = { ...body };
  let errors = [];

  // Check for the required parameters
  Object.keys(parameters).forEach((paramName) => {
    parameters;

    // iterate over the parameter types and compare against the parameter type of the rules
    if (typeof bodyClone[paramName] !== typeof paramName) {
      errors.push({
        field: paramName,
        message: "Field types do not match",
        code: "WRONG_FIELD_TYPE",
      });
    }

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
