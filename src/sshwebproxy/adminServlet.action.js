var imp = JavaImporter(java.util, java.io, java.lang,
		Packages.com.ericdaugherty.sshwebproxy);

var PAGE_HOME = sz.web
		.ctx("/meta/myTest/analyses/sshweb/custom.action?method=index");
var PAGE_LOGIN = sz.web
		.ctx("/meta/myTest/analyses/sshweb/custom.action?method=login");
var PROPERTIES_FILE = "myTest:/analyses/sshweb/sshwebproxy.properties";

/** ***************admin servlet************************* */
/**
 * 用户登录处理方法,登录成功则向session中添加user信息
 */
function execute(request, response) {
	// 重定向页面
	var page = PAGE_LOGIN;
	var sshSession = new imp.SshSession(request.getSession());
	var username = request.username;
	var password = request.password;
	if (username == null || username.length == 0) {
		sshSession.setErrorMessage("Please specify a vaild username.");
	} else if (password == null || password.length == 0) {
		sshSession.setErrorMessage("Please specify a valid password.");
	} else {
		username = trim(username);
		password = trim(password);
		var properties = loadProperties(PROPERTIES_FILE);
		var correctPassword = properties.getProperty(username);
		if (correctPassword == null) {
			sshSession.setErrorMessage("Unknown User.");
		} else {
			if (correctPassword == password) {
				sshSession.setUser(username);
				page = PAGE_HOME;
			} else {
				sshSession.setErrorMessage("Incorrect Password.");
			}
		}
	}
	response.sendRedirect(page);

}

function loadProperties(filepath) {
	var properties = new imp.Properties();
	var entity = sz.metadata.get(filepath);
	var is;
	try {
		is = entity.getContentInputStream();
	} finally {
		if (is) {
			is.close();
		}
	}
	properties.load(is);
	return properties;
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

function main() {
	var properties = new imp.Properties();
	// var syspps = imp.System.getProperties();
	var filePath = "myTest:/analyses/sshweb/sshwebproxy.properties";
	var entity = sz.metadata.get(filePath);

	// var test = new imp.FileInputStream("d:/users.txt");
	// var keyValues = file.readProperties() ;

	var is;
	try {
		is = entity.getContentInputStream();
	} finally {
		if (is) {
			is.close();
		}
	}
	properties.load(is);

	println(properties.getProperty("sshwebproxy"));
	println(properties.getProperty("admin"));

}