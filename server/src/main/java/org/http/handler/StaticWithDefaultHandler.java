package org.http.handler;

import org.glassfish.grizzly.http.server.Request;
import org.glassfish.grizzly.http.server.Response;
import org.glassfish.grizzly.http.server.StaticHttpHandler;

public class StaticWithDefaultHandler extends StaticHttpHandler {
	
	private String defaultURI;
	
	public StaticWithDefaultHandler(String uri) {
		defaultURI = uri;
	}
	
	@Override
	protected boolean handle(String uri, Request request, Response response) throws Exception {
		if(uri.equals("/")) return super.handle(defaultURI, request, response);
		return super.handle(uri, request, response);
	}
	
}
