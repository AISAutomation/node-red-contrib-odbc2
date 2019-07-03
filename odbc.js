module.exports = function(RED) {
	const mustache = require("mustache");
	const odbc = require('odbc');

	function connection(config) {
	    RED.nodes.createNode(this, config);
		this.connection = `${config.connection};UID=${confi.username};PWD=${config.password}`;
	}
	
  	RED.nodes.registerType("ODBC_CONNECTION", connection, {
	    credentials: {
			username: {type:"text"},
			password: {type:"password"}
	    }
	});

  	function odbc(config) {
		RED.nodes.createNode(this, config);
		const node = this;
		node.connection = RED.nodes.getNode(config.odbc);
		node.query = config.query;
		node.outfield = config.outField;

		odbc.pool(node.connection, (error, pool) => {
			if (error) {
				node.error(error);
				node.status({fill: "red", shape: "ring", text: error.message});
			}

			pool.connect((error, connection) => {
				if (error) {
					node.error(error);
					node.status({fill: "red", shape: "ring", text: error.message});
				}

				node.on('input', (msg) => {
					node.status({fill:"blue",shape:"dot",text:"requesting"});
					const query = mustache.render(node.query, msg);
	
					pool.query(query, (error, results) => {
						if (error) {
							node.error(error);
							node.status({fill: "red", shape: "ring", text: error.message});
							pool.close();
							return;
						}

						msg.payload = results;

						node.send(msg);
						node.status({fill:'blue',shape:'dot',text:'finish'});
					})
				});
			});
		});
	}
  	RED.nodes.registerType("ODBC", odbc);
}