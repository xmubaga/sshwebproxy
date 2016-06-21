var imp = JavaImporter(Packages.com.ericdaugherty.sshwebproxy, java.util,
		java.io);
var PAGE_HOME = sz.web
		.ctx("/meta/myTest/analyses/sshweb/custom.action?method=index");
var PAGE_SHELL = sz.web
		.ctx("/meta/myTest/analyses/sshweb/custom.action?method=shell");
var PAGE_LOGIN = sz.web
		.ctx("/meta/myTest/analyses/sshweb/custom.action?method=login");

function main() {
}

/** *****************shell Servlet************************** */
function execute(request, response) {
	debugger;
	var sshSession = new imp.SshSession(request.getSession());
	if (!sshSession.isValid()) {
		response.sendRedirect(PAGE_LOGIN);
		return;
	}

	var action = request.getParameter("action");
	if (action == null || trim(action).length == 0) {
		response.sendRedirect(PAGE_HOME);
	}

	action = trim(action);
	if (action == "write") {
		if (request.getParameter("write") != null) {
			write(request, response, false);
		} else if (request.getParameter("writeline") != null) {
			write(request, response, true);
		} else {
			response.sendRedirect(PAGE_HOME);
		}
	} else {
		response.sendRedirect(PAGE_HOME);
	}
}

// 通过shell通道向远程主机写入命令
function write(request, response, sendNewLine) {
	var session = new imp.SshSession(request.getSession());
	var connectionInfo = request.getParameter("connection");
	var channelId = request.getParameter("channel");
	var valid = false;

	// Get the Channel and write to it.
	var sshConnection = session.getSshConnection(connectionInfo);
	var shellChannel = null;
	if (sshConnection != null) {
		shellChannel = sshConnection.getShellChannel(channelId);
		if (shellChannel != null) {
			var data = request.getParameter("data");
			shellChannel.write(data, sendNewLine);
			valid = true;
		}
	}

	// Redirect to the result page.
	if (valid) {
		var shellUrl = PAGE_SHELL + "&connection=" + connectionInfo
				+ "&channel=" + channelId;
		response.sendRedirect(shellUrl);
	} else {
		session.setErrorMessage("Invalid connection or channel.");
		response.sendRedirect(PAGE_HOME);
	}
}