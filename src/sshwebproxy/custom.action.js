var imp = JavaImporter(Packages.com.ericdaugherty.sshwebproxy,
		Packages.org.apache.commons.fileupload, java.util, java.io,
		Packages.com.sshtools.j2ssh.sftp.SftpFile);
var PAGE_HOME = sz.web
		.ctx("/meta/myTest/analyses/sshweb/custom.action?method=index");
var PAGE_SHELL = sz.web
		.ctx("/meta/myTest/analyses/sshweb/custom.action?method=shell");
var PAGE_FILE = sz.web
		.ctx("/meta/myTest/analyses/sshweb/custom.action?method=file");

function main() {
}
/** ***************login Action************************* */
function login(request, response) {
	setNoCache(response);
	return "login.ftl";
}

/** ***********index Action 为index.ftl提供数据*********** */
function index(request, response) {
	// debugger;
	var sshSession = new imp.SshSession(request.getSession());
	var connections = sshSession.getConnections();
	if (connections != null && connections.size() > 0) {
		var connectionIterator = connections.iterator();
		var connectionInfos = [];
		while (connectionIterator.hasNext()) {
			var connection = connectionIterator.next();
			var connectionInfo = connection.getConnectionInfo();
			var chennelInfos = [];
			var channels = connection.getChannels();
			if (channels != null && channels.size() > 0) {
				var channelIterator = channels.iterator();
				while (channelIterator.hasNext()) {
					var sshchannel = channelIterator.next()
					var channelId = sshchannel.getChannelId();
					var channelType = sshchannel.getChannelType();
					var channelPage = null;
					if (channelType == "Shell") {
						channelPage = PAGE_SHELL + "&connection="
								+ connectionInfo + "&channel=" + channelId;
					} else if (channelType == "File") {
						channelPage = PAGE_FILE + "&connection="
								+ connectionInfo + "&channel=" + channelId;
					}
					var isConnection = sshchannel.isConnected();
					chennelInfos.push({
								"channelId" : channelId,
								"channelPage" : channelPage,
								"channelType" : channelType,
								"isConnection" : isConnection
							});
				}
			}
			connectionInfos.push({
						"connectionInfo" : connectionInfo,
						"chennelInfos" : chennelInfos
					});
		}
		response.attr("connectionInfos", connectionInfos);
	}
	if (sshSession.isRestrictedMode()) {
		var host = sshSession.getRestrictedModeHost();
		response.attr("host", host);
	}
	setNoCache(response);
	return "index.ftl";
}

/** ***************index Action 为文件系统页面file.ftl提供数据************************* */
function file(request, response) {
	var connectionInfo = request.getParameter("connection");
	var channelId = request.getParameter("channel");
	response.attr("connectionInfo", connectionInfo);
	response.attr("channelId", channelId);
	var sshSession = new imp.SshSession(request.getSession());

	var sshConnection = sshSession.getSshConnection(connectionInfo);
	var fileChannel = null;
	var valid = false;
	if (sshConnection != null) {
		fileChannel = sshConnection.getFileChannel(channelId);
		if (fileChannel != null) {
			valid = true;
			var currentDirectory = fileChannel.encodeHTML(fileChannel
					.getCurrentDirectory());
			response.attr("currentDirectory", currentDirectory);
			var fileList = fileChannel.getCurrentDirectoryListing();
			var listInfo = [];
			for (var i = 0; i < fileList.length; i++) {
				var file = fileList[i];
				if (file.isDirectory()) {
					var href = "./fileServlet.action?action=changeDirectory&connection="
							+ connectionInfo
							+ "&channel="
							+ channelId
							+ "&directory=" + file.getFilename();
					var fileName = file.getFilename();
					var longName = fileChannel.encodeHTML(file.getLongname());
					listInfo.push({
								"href" : href,
								"fileName" : fileName,
								"longName" : longName
							});
				} else {
					var href = "./fileServlet.action?action=download&connection="
							+ connectionInfo
							+ "&channel="
							+ channelId
							+ "&filename=" + file.getFilename();
					var fileName = file.getFilename();
					var longName = fileChannel.encodeHTML(file.getLongname());
					listInfo.push({
								"href" : href,
								"fileName" : fileName,
								"longName" : longName
							});
				}
			}
			response.attr("fileInfos", listInfo);
		}
	}
	response.attr("isvalid", valid);
	response.attr("PAGE_HOME", PAGE_HOME);
	setNoCache(response);
	return "file.ftl";
}

/** ***************index Action 为shell操作页面提供数据************************* */
function shell(request, response) {
	response.attr("requestQueryString", request.getQueryString());
	response.attr("requestURL", request.getRequestURL());

	var connectionInfo = request.getParameter("connection");
	var channelId = request.getParameter("channel");

	response.attr("connectionInfo", connectionInfo);
	response.attr("channelId", channelId);

	var sshSession = new imp.SshSession(request.getSession());
	var sshConnection = sshSession.getSshConnection(connectionInfo);

	var shellChannel = null;
	var lines = [];
	var valid = false;
	var isConnected = false;

	if (sshConnection != null) {
		shellChannel = sshConnection.getShellChannel(channelId);
		if (shellChannel != null) {
			do {
				shellChannel.read();
				lines = addArray(lines, shellChannel.getScreen());
				var lastLine = lines[lines.length - 1];
				var lastChar = lastLine.charAt(lastLine.length - 1);
			} while (lastChar != " "); // && lastChar != "#"

			valid = true;
			isConnected = shellChannel.isConnected();
		}
	}
	response.attr("isvalid", valid);
	response.attr("isConnected", isConnected);

	var div_html = getData(lines);
	response.attr("div_html", div_html);

	response.attr("PAGE_HOME", PAGE_HOME);
	setNoCache(response);
	return "shell.ftl"
}

// 将ssh shell通道读取的返回信息转换成 ftl视图所需要的数据
function getData(lines) {
	var divData = [];
	var length = lines.length;
	for (var index = 0; index < length; index++) {
		var row = lines[index];
		var at = row.indexOf("[");
		if (at != -1 && row.charAt(at - 1) == "*") {
			var line1 = row.substring(0, at) + "<br />";
			var line2 = row.substring(at, row.length);
			divData.push("<br />" + line1 + line2);

		} else {
			divData.push("<br />" + row);
		}
	}
	var html = divData.join("");
	html = html.substring(0, html.length - 1) + "<span id='shell-cursor'>"
			+ html.substring(html.length - 1, html.length)
			+ "</span> <br /><br /><br /><br />"
	return html;
}

// 将一个java字符串数组对象的各个元素加到js数组中,并且忽略空字符串
function addArray(jsArray, javaArray) {
	for (var i = 0; i < javaArray.length; i++) {
		var row = javaArray[i];
		if (row != null && row != "")
			jsArray.push(row);
	}
	return jsArray;
}

// 设置响应为无缓存状态
function setNoCache(response) {
	response.setHeader("Cache-Control", "no-cache"); // HTTP 1.1
	response.setHeader("Pragma", "no-cache"); // HTTP 1.0
	response.setDateHeader("Expires", 0); // prevents caching at the proxy
											// server
}

function security(request, response) {
	var sshSession = new SshSession(request.getSession());
	if (!sshSession.isValid()) {
		var restrictedModeHost = imp.System
				.getProperty("sshwebproxy.restricted");
		if (restrictedModeHost != null && restrictedModeHost.length > 0) {
			sshSession.setRestrictedModeHost(restrictedModeHost);
		} else {
			response.sendRedirect(PAGE_LOGIN);
		}
	}
}