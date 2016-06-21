<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN"
            "http://www.w3.org/TR/html4/strict.dtd">
<html>

<script language='javascript'>

function getKey( event )
{
    if (window.event)
    {
        return window.event.keyCode;
    }
    else if (event)
    {
        return event.which;
    }
    else
    {
        return null;
    }
}

function textBoxKeypress( event )
{
    var key = getKey( event );
    if (key == null) return true;

    if ( key==13 )
    {
        document.ShellClient.writeline.click()
        return false;
    }

}

onkeydown="if ((event.which && event.which == 13) || (event.keyCode && event.keyCode == 13)) {;return false;} else return true;"

function writeControlChar( chars )
{
    document.forms['ShellClient'].data.value = document.forms['ShellClient'].data.value + chars;
    document.forms['ShellClient'].data.focus();
}

function viewBuffer()
{
    window.open("shell-buffer.jsp?${requestQueryString}", "Buffer", "width=800, height=600, location=no, menubar=no, status=no, toolbar=yes, scrollbars=yes, resizable=yes");
}

function refresh()
{
    window.location = "${requestURL}?${requestQueryString}";
}

window.onload=function(){ 
    var div_shell = document.getElementById("shell");
	div_shell.scrollTop = div_shell.scrollHeight;
}

</script>

<head>
    <title>SshWebProxy - Shell</title>
    <link type="text/css" href="sshwebproxy.css" rel="stylesheet">
</head>
<body>	
<div class="pannel">
	<#if PAGE_HOME??>
		<a href=${PAGE_HOME}>Home主页</a>
	</#if>
	<hr/>
	<div id="shell"  style="overflow:auto; height: 400px;">
		<#if isvalid>
			<span>${div_html}</span>
		<#else>
			Invalid Connection or Channel.(连接或者通道已经失效。)	
		</#if>
	</div>
	
	<p/>
	<#if isConnected>
		<form name="ShellClient" method="post" action="./shellServlet.action">
    	<input type="hidden" name="action" value="write" />
		<input type="hidden" name="connection" value=${connectionInfo} />
		<input type="hidden" name="channel" value=${channelId} />
    	命令输入：<input type="text" name="data" onKeyPress="return textBoxKeypress(event)" />
    	<input type="submit" name="writeline" value="Write Line" />
    	<input type="submit" name="write" value="Write" />
    	<input type="button" value="View Buffer" onClick="viewBuffer()" />
    	<input type="button" value="Refresh" onClick="refresh()" />
	</form>
	
	<script language='javascript'>
    	document.forms['ShellClient'].data.focus();
	</script>
	<p>
		To write control characters, write them as their hex value, prefixed with #.
		For example:
			ESC is #1B.  
			To write a # Character, write #23.  
			The control key is sent as #-1, and causes the next character to be sent as if the Ctrl key were held down.
	</p>
	<p>
		The following buttons add control characters to the write input field.
	</p>

	<form name="SpecialChars">

   		<input type="button" value="CTRL" onclick="writeControlChar('#-1');" />
    	<input type="button" value="ESC" onclick="writeControlChar('#1B');" />
    	<input type="button" value="#" onclick="writeControlChar('#23');" />

	</form>
	<#else>
		Connection is closed.
	
	</#if>
</div>
</body>