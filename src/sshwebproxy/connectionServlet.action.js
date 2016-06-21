var imp = JavaImporter(Packages.com.ericdaugherty.sshwebproxy,
		Packages.org.apache.commons.fileupload, java.util, java.io);
var PAGE_HOME = sz.web
		.ctx("/meta/myTest/analyses/sshweb/custom.action?method=index");
var PAGE_LOGIN = sz.web
		.ctx("/meta/myTest/analyses/sshweb/custom.action?method=login");
var PAGE_SHELL = sz.web
		.ctx("/meta/myTest/analyses/sshweb/custom.action?method=shell");
var PAGE_FILE = sz.web
		.ctx("/meta/myTest/analyses/sshweb/custom.action?method=file");

function main() {
}

/** ================= connection Servlet =========================* */
function execute(request, response) {
	debugger;
	if (request.getMethod() != "POST") {
		return;
	}
	var sshSession = new imp.SshSession(request.getSession());
	if (!sshSession.isValid()) {
		response.sendRedirect(PAGE_LOGIN);
		return;
	}
	var action = request.getParameter("action");

	if (action == null || trim(action).length == 0) {
		response.sendRedirect(PAGE_LOGIN);
		return;
	}

	action = trim(action);
	if (action == "openConnection") {
		openConnection(request, response, null);
	} else if (action == "closeConnection") {
		closeConnection(request, response);
	} else if (action == "openShell") {
		openShellChannel(request, response);
	} else if (action == "openFile") {
		openFileChannel(request, response);
	} else if (action == "closeChannel") {
		closeChannel(request, response);
	} else {
		response.sendRedirect(HOME_PAGE);
	}
}

/**
 * 关闭客服端与服务器的连接
 * 
 * @param {}
 *            request
 * @param {}
 *            response
 */
function closeConnection(request, response) {
	var sshSession = new imp.SshSession(request.getSession());
	var connectionInfo = request.getParameter("connection");
	var sshConnection = sshSession.getSshConnection(connectionInfo);

	// If the sshConnection could not be found, give up.
	if (sshConnection == null) {
		sshSession
				.setErrorMessage("Requested sshConnection could not be found.");
	} else {
		sshConnection.close();
		sshSession.removeConnection(connectionInfo);
	}

	response.sendRedirect(PAGE_HOME);

}

/**
 * 关闭客服端与服务器连接中的通道，或者是File类型、或者是Shell类型
 * 
 * @param {}
 *            request
 * @param {}
 *            response
 */
function closeChannel(request, response) {

	var sshSession = new imp.SshSession(request);
	var connectionInfo = request.getParameter("connection");
	var connection = sshSession.getSshConnection(connectionInfo);

	if (connection == null) {
		sshSession.setErrorMessage("Requested connection could not be found.");
	} else {
		var channelId = request.getParameter("channel");
		connection.closeChannel(channelId);
	}

	response.sendRedirect(PAGE_HOME);
}
/**
 * 创建一个客服端到服务器的连接
 * 
 * @param {}
 *            request
 * @param {}
 *            response
 * @param {}
 *            multiPartItems
 */
function openConnection(request, response, multiPartItems) {

	var session = new imp.SshSession(request.getSession());

	var error = null;
	var host = request.getParameter("host");
	var port = request.getParameter("port");

	var username = request.getParameter("username");

	var authenticationType = request.getParameter("authenticationType");

	// If we are in restricted mode, override whatever may have come from the
	// client.
	if (session.isRestrictedMode()) {
		host = session.getRestrictedModeHost();
		port = "22";
	}

	// Determine which authentication method to use.
	var isKeyAuthentication = false;
	if (authenticationType != null && authenticationType == "keyauthentication") {
		isKeyAuthentication = true;
	}

	// Parse the authentication parameters
	var password = null;
	var keyFileItem = null;
	var keyPassPhrase = null;
	if (!isKeyAuthentication) {
		password = request.getParameter("password")
	} else {
		keyFileItem = getFile(multiPartItems);
		keyPassPhrase = request.getParameter("keypassword");
	}

	var channelType = request.getParameter("channelType");

	// 验证所有的input输入参数存在性
	if (host == null || trim(host).length == 0 || port == null
			|| trim(port).length == 0) {
		error = "Please specify a valid host and port.";
	} else if (!isKeyAuthentication
			&& (username == null || trim(username).length == 0
					|| password == null || trim(password).length == 0)) {
		error = "Please specify a valid username and password.";
	} else if (isKeyAuthentication && (keyFileItem == null)) {
		error = "Please specify a key file.";
	}

	if (error == null) {
		try {
			var connectionInfo = imp.SshConnection.getConnectionInfo(host,
					port, username);

			// Look for an existing open connection.
			var sshConnection = session.getSshConnection(connectionInfo);

			// If the connection does not exist yet, open a new one.
			if (sshConnection == null) {
				if (isKeyAuthentication) {
					sshConnection = new imp.SshConnection(host, port, username,
							keyFileItem.get(), keyPassPhrase);
				} else {
					sshConnection = new imp.SshConnection(host, port, username,
							password);
				}
				if (!session.addSshConnection(sshConnection)) {
					sshConnection.close();
					sshConnection = session.getSshConnection(connectionInfo);
					if (sshConnection == null) {
						session.setErrorMessage("Error Opening Connection.");
						response.sendRedirect(PAGE_HOME);
						return;
					}
				}
			}

			// Open the requested SshChannel
			if (channelType != null && channelType == "Shell") {
				_openShellChannel(sshConnection, response);
			} else if (channelType != null && channelType == "File") {
				_openFileChannel(sshConnection, response);
			} else {
				response.sendRedirect(PAGE_HOME);
			}
		} catch (err) {
			session.setErrorMessage(err);
			response.sendRedirect(PAGE_HOME);
		}
	} else {
		session.setErrorMessage(error);
		response.sendRedirect(PAGE_HOME);
	}

}

/**
 * 创建一个客服端到服务器连接的Shell通道
 * 
 * @param {}
 *            request
 * @param {}
 *            response
 */
function openShellChannel(request, response) {
	var sshSession = new imp.SshSession(request.getSession());
	var connectionInfo = request.getParameter("connection");
	if (connectionInfo == null || trim(connectionInfo).length == 0) {
		sshSession.setErrorMessage("Requested connection could not be found.");
		response.sendRedirect(PAGE_HOME);
	} else {
		var sshConnection = sshSession.getSshConnection(connectionInfo);
		_openShellChannel(sshConnection, response)
	}
}

function _openShellChannel(sshConnection, response) {
	try {
		var shellChannel = sshConnection.openShellChannel();
		var shellUrl = PAGE_SHELL + "&connection="
				+ sshConnection.getConnectionInfo() + "&channel="
				+ shellChannel.getChannelId();
		response.sendRedirect(shellUrl);
	} catch (err) {
		response.sendRedirect(PAGE_HOME);
	}
}

/**
 * 创建一个客服端到服务器连接的File通道
 * 
 * @param {}
 *            request
 * @param {}
 *            response
 */
function openFileChannel(request, response) {

	var sshSession = new imp.SshSession(request.getSession());
	var connectionInfo = request.getParameter("connection");
	var connection = sshSession.getSshConnection(connectionInfo);

	if (connection == null) {
		sshSession.setErrorMessage("Requested connection could not be found.");
		response.sendRedirect(PAGE_HOME);
	} else {
		_openFileChannel(connection, response);
	}

}

function _openFileChannel(sshConnection, response) {
	try {
		var fileChannel = sshConnection.openFileChannel();
		var fileURL = PAGE_FILE + "&connection="
				+ sshConnection.getConnectionInfo() + "&channel="
				+ fileChannel.getChannelId();
		response.sendRedirect(fileURL);
	} catch (err) {
		response.sendRedirect(PAGE_HOME);
	}
}

/** *******************************以下是扩展功能函数，暂未实现******************************************** */
function getParameter(multiPartItems, parameterName) {
	var iter = multiPartItems.iterator();
	while (iter.hasNext()) {
		var fileItem = iter.next();
		if (fileItem.isFormField()) {
			if (parameterName == fileItem.getFieldName()) {
				return fileItem.getString();
			}
		}
	}
	return null;
}

function getFile(multiPartItems) {
	for (var i = 0; i < multiPartItems.length; i++) {
		if (!fileItem.isFormField()) {
			return fileItem;
		}
	}
	return null;
}

/**
 * 去掉字符串中两边的空格
 * 
 * @param {}
 *            str
 * @return {}
 */
function trim(str) {
	return str.replace(/(^\s*)|(\s*$)/g, "");
}