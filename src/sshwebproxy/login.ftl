
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN"
            "http://www.w3.org/TR/html4/strict.dtd">
<html>

<head>
    <title>SshWebProxy - Home</title>
    <link type="text/css" href="sshwebproxy.css" rel="stylesheet">
</head>


<body>
<#--
<#include "./displayerror.ftl">
-->
<p class="header">SSH客服端网页登录</p>
<div class="login">
    <form name="ShellClient" method="post" action="./adminServlet.action">
    <input type="hidden" name="action" value="login" /><br />
    Username: <input type="text" name="username"  value=""/>
    <br/>
	<br/>
    Password: <input type="password" name="password" value=""/>
    <br/>
	<br/>
    <input type="submit" name="write" value="Login"/>
</form>
</div>
<br />

</body>

</html>
