var imp = JavaImporter(Packages.com.ericdaugherty.sshwebproxy,
		Packages.org.apache.commons.fileupload, java.util, java.io);
var PAGE_HOME = sz.web
		.ctx("/meta/myTest/analyses/sshweb/custom.action?method=index");
var PAGE_LOGIN = sz.web
		.ctx("/meta/myTest/analyses/sshweb/custom.action?method=login");
var PAGE_FILE = sz.web
		.ctx("/meta/myTest/analyses/sshweb/custom.action?method=file");

function main() {
}

function execute(request, response) {

	debugger;
	var sshSession = new imp.SshSession(request.getSession());
	if (!sshSession.isValid()) {
		response.sendRedirect(PAGE_LOGIN);
		return;
	}

	if (imp.FileUpload.isMultipartContent(request)) {
		upload(request, response);
	} else {
		var action = request.getParameter("action");
		if (action == null || trim(action).length == 0) {
			response.sendRedirect(PAGE_HOME);
		}

		action = trim(action);
		if (action == "download") {
			download(request, response);
		} else if (action == "changeDirectory") {
			changeDirectory(request, response);
		} else {
			response.sendRedirect(PAGE_HOME);
		}
	}
}

// 将用户请求的文件内容写入响应中，供用户下载
function download(request, response) {
	var session = new imp.SshSession(request.getSession());
	var connectionInfo = request.getParameter("connection");
	var channelId = request.getParameter("channel");
	var filename = request.getParameter("filename");

	// Get the Channel
	var sshConnection = session.getSshConnection(connectionInfo);
	var fileChannel = null;
	if (sshConnection != null) {
		fileChannel = sshConnection.getFileChannel(channelId);
		if (fileChannel != null) {
			// Setup the headers information
			response.setContentType("application/x-download");
			response.setHeader("Content-Disposition", "attachment; filename="
							+ filename);

			// Start writing the output.
			var outputStream = response.getOutputStream();
			fileChannel.downloadFile(filename, outputStream);
		}
	}

}

// 用户点击目录，显示该目录的孩子列表
function changeDirectory(request, response) {
	var session = new imp.SshSession(request.getSession());
	var connectionInfo = request.getParameter("connection");
	var channelId = request.getParameter("channel");
	var directory = request.getParameter("directory");
	var redirectPage = PAGE_HOME;

	// Get the Channel
	var sshConnection = session.getSshConnection(connectionInfo);
	var fileChannel = null;
	if (sshConnection != null) {
		fileChannel = sshConnection.getFileChannel(channelId);
		if (fileChannel != null) {
			if (!fileChannel.changeDirectory(directory)) {
				session.setErrorMessage("Directory Change failed.");
			}
			redirectPage = PAGE_FILE + "&connection=" + connectionInfo
					+ "&channel=" + channelId;
		}
	}

	// Redirect to the result page.
	response.sendRedirect(redirectPage);
}

function upload(request, response) {
}