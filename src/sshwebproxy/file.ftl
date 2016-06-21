
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN"
            "http://www.w3.org/TR/html4/strict.dtd">
<html>

<head>
    <title>SshWebProxy - File</title>
    <link type="text/css" href="sshwebproxy.css" rel="stylesheet">
</head>


<body>
<div class="file">
<p class="links">
<#if PAGE_HOME??>
	<a href=${PAGE_HOME}>Home主页</a>
</#if>
</p>

<#if isvalid>
当前目录:
	<font color="red">${currentDirectory}</font>
<p class="code">
<#if (fileInfos?size == 0)>
Error Getting Directory Listing!
<#else>
<table>
	
	<tbody>
<#list fileInfos as fileInfo>
    <tr>
		<td><a href=${fileInfo.href}> ${fileInfo.fileName} </a></td>
		<td>${fileInfo.longName}</td>
    </tr>
</#list>  
	</tbody>
</table>
</#if>
</p>
<div class="upload">
<form ENCTYPE="multipart/form-data" name="uploadFile" method="post" action="./fileServlet.action">
    <input type="hidden" name="action" value="upload" />
	<input type="hidden" name="connection" value="${connectionInfo}" />
	<input type="hidden" name="channel" value="${channelId}" />
    Romte Name: <input type="text" name="filename" /> &nbsp 
	File To Upload: <input type="file" name="file" />
    <input type="submit" value="上传至当前目录" />
</form>
</div>
</#if>
</div>
</body>

</html>
