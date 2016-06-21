
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN"  "http://www.w3.org/TR/html4/strict.dtd">
<html>

<head>
    <title>SshWebProxy - Home</title>
    <link type="text/css" href="sshwebproxy.css" rel="stylesheet">
<head>

<body>
	
<p class="header">SSHWebProxy 主页</p>
<div class="index">
<#if connectionInfos ??>
<#list connectionInfos as connection>
    <p class="sub-header">当前连接：</p>
    <table border='1'>
        <tr>
			<td colspan='4'>连接信息:</td>
        </tr>

        <tr>
			<td>${connection.connectionInfo}</td>
            <td>
                <form name="${connection.connectionInfo}-close" method="post" action="./connectionServlet.action">
                    <input type="hidden" name="action" value="closeConnection" />
                    <input type="hidden" name="connection" value= ${connection.connectionInfo} />
                    <input type="submit" value="关闭连接" />
                </form>
            </td>
            <td>
                <form name="${connection.connectionInfo}-shell" method="post" action="./connectionServlet.action">
                    <input type="hidden" name="action" value="openShell" />
                    <input type="hidden" name="connection" value=${connection.connectionInfo} />
                    <input type="submit" value="新建Shell窗口" />
                </form>
            </td>
            <td>
                <form name="${connection.connectionInfo}-File" method="post" action="./connectionServlet.action">
                    <input type="hidden" name="action" value="openFile" />
                    <input type="hidden" name="connection" value=${connection.connectionInfo} />
                    <input type="submit" value="新建File窗口" />
                </form>
            </td>
        </tr>
        <tr>
            <td colspan='4'>
            <#if (connection.chennelInfos?size > 0) >
			<#list connection.chennelInfos as channel>
                <table border='1'>
                    <tr>
						<td colspan='2'>窗口:</td>
                    </tr>

                    <tr>
						<td><a href=${channel.channelPage}> ${channel.channelId} - ${channel.channelType}</a></td>
                        <td>
                            <form name="${connection.connectionInfo}-${channel.channelId}-close" method="post" action="./connectionServlet.action">
                                <input type="hidden" name="action" value="closeChannel" />
                                <input type="hidden" name="connection" value=${connection.connectionInfo} />
                                <input type="hidden" name="channel" value=${channel.channelId} />
                                <input type="submit" value="关闭通道" />
                            </form>
                        </td>
                    </tr>
                </table>
			</#list>
			</#if>
            </td>
        </tr>
    </table>
</#list>
</#if>
    <p>
		Connection Setup :
    </p>
	<div>
		<form ENCTYPE="multipart/form-data" name="ConnectionSetup" method="post" action="./connectionServlet.action" >
        <input type="hidden" name="action" value="openConnection" />
		<#if host ??>
			Host: ${host} Port: 22
		<#else>
       	 	Host: <input type="text" name="host" value="" />
        	Port: <input type="text" name="port" value="22" />
		</#if>
		<br/>	
        <br/>
        	Username: <input type="text" name="username" value="" />
			
        <br/>
		<br/>
        	Authentication Type:
        <input type="radio" name="authenticationType" value="passwordauthentication" checked />	   Password
        <input type="radio" name="authenticationType" value="passwordauthentication"  />	Key
        <br/>
		<br/>
        	Password: <input type="password" name="password" value="" />
        <br/>
		<br/>
        	Key File: <input type="file" name="keyfile" />
        <br/>
		<br/>
        	Key PassPhrase: <input type="password" name="keypassword" />
        <br/>
		<br/>
		<span>通道类型:</span>
        <input type="radio" value="None" name="channelType"> None</input>
        <input type="radio" value="Shell" name="channelType" checked> Shell</input>
        <input type="radio" value="File" name="channelType"> File</input>
        <br/>
		<br/>
        <input type="submit" value="Open" />
   	 	<form>
	</div>
    <script language='javascript'>
		document.forms['ConnectionSetup'].host.focus();
    </script>
</div>
<body>

</html>