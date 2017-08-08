module.exports = exception;

const Names = {
  QIN: 'QinException',
  EVENT_ABORT: 'QinEventAbortException',
  CONTEXT_EMIT: 'QinContextEmitException',
};

function exception(err, name) {
  let newErr = err;
  if (!(newErr instanceof Error)) {
    newErr = new Error(err);
  }

  const newName = name || Names.QIN;
  newErr.name = newName;
  newErr.message = `[${newName}]${newErr.message}`;
  return newErr;
}

Object.assign(exception, Names, {
  createEventAbortException,
  createContextEmitException
});

function createEventAbortException(err) {
  return exception(err, Names.EVENT_ABORT);
}

function createContextEmitException(err) {
  return exception(err, Names.CONTEXT_EMIT);
}
