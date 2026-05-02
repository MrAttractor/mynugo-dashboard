exports.handler = async function(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      gkey: process.env.GAPI || ''
    })
  };
};
