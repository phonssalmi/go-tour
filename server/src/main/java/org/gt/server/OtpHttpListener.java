package org.gt.server;

import org.glassfish.grizzly.http.server.NetworkListener;
import org.glassfish.grizzly.ssl.SSLContextConfigurator;
import org.glassfish.grizzly.ssl.SSLEngineConfigurator;
import org.glassfish.grizzly.threadpool.ThreadPoolConfig;

public class OtpHttpListener extends NetworkListener {

	public OtpHttpListener(String address, int port) {
		super("OtpApiListener", address, port);
	}

	public OtpHttpListener withSSL(SSLContextConfigurator ctxCfg) {
		this.setSecure(true);
		this.setSSLEngineConfig(new SSLEngineConfigurator(ctxCfg)
				.setClientMode(false)
				.setNeedClientAuth(false));
		
		return this;
	}
	
	public OtpHttpListener withoutSSL() {
		this.setSecure(false);
		return this;
	}
	
	public OtpHttpListener withThreadPooling(ThreadPoolConfig tpCfg) {
		this.getTransport().setWorkerThreadPoolConfig(tpCfg);
		return this;
	}

}
