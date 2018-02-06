package org.gt.server;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.BindException;
import java.util.Properties;

import org.glassfish.grizzly.http.CompressionConfig;
import org.glassfish.grizzly.http.server.HttpHandler;
import org.glassfish.grizzly.http.server.HttpServer;
import org.glassfish.grizzly.http.server.StaticHttpHandler;
import org.glassfish.grizzly.ssl.SSLContextConfigurator;
import org.glassfish.grizzly.threadpool.ThreadPoolConfig;
import org.glassfish.jersey.server.ContainerFactory;
import org.http.handler.StaticWithDefaultHandler;
import org.opentripplanner.standalone.CommandLineParameters;
import org.opentripplanner.standalone.OTPApplication;
import org.opentripplanner.standalone.OTPServer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class OtpServerMain {
	private static final String OPTS_ADDRESS			= "otp.server.address";
	private static final String OPTS_PORT				= "otp.server.port";
	private static final String OPTS_KEYSTORE_PATH		= "otp.ssl.keystore.file";
	private static final String OPTS_KEYSTORE_PASS		= "otp.ssl.keystore.pass";
	private static final String OPTS_GRAPH_DIR			= "otp.server.graph.dir";
	private static final String OPTS_OTP_DATA_DIR		= "otp.server.data.dir";
	private static final String OPTS_CLIENT_DIR			= "otp.server.client.dir";

	private ThreadPoolConfig defaultThreadPooling = ThreadPoolConfig.defaultConfig().setCorePoolSize(1).setMaxPoolSize(Runtime.getRuntime().availableProcessors());
	
	private Properties opts;
	private Logger logg = LoggerFactory.getLogger("OtpServerMain");
	private HttpServer httpServer;
	
	public OtpServerMain(Properties options) {
		opts = options;
		propertiesToParams();	//just to validate the opts
		
	}

	public void start() {
		logg.info("Starting server..");
		httpServer = new HttpServer();
		
		int port = Integer.parseInt(opts.getProperty(OPTS_PORT));
		
		File clientRootDir = new File(opts.getProperty(OPTS_CLIENT_DIR));
		if(!clientRootDir.exists() || !clientRootDir.isDirectory())
			throw new IllegalArgumentException("Property client dir must denote to an existing directory.");
		
		OtpHttpListener httpListener = new OtpHttpListener(opts.getProperty(OPTS_ADDRESS), port)
				.withThreadPooling(defaultThreadPooling);
		
		boolean ssl = false;
		if(opts.containsKey(OPTS_KEYSTORE_PASS) && opts.containsKey(OPTS_KEYSTORE_PATH)) {
			logg.info("Initializing SSL context");
			
			SSLContextConfigurator sslConfig = new SSLContextConfigurator();
			sslConfig.setKeyStoreFile(opts.getProperty(OPTS_KEYSTORE_PATH));
			sslConfig.setKeyStorePass(opts.getProperty(OPTS_KEYSTORE_PASS));
			
			httpListener.withSSL(sslConfig);
			ssl = true;
		}
		
		//unsure if these are needed, but let's keep them..
		CompressionConfig cc = httpListener.getCompressionConfig();
        cc.setCompressionMode(CompressionConfig.CompressionMode.ON);
        cc.setCompressionMinSize(50000); // the min number of bytes to compress
        cc.setCompressableMimeTypes("application/json", "text/json"); // the mime types to compress
		
        httpServer.addListener(httpListener);
		
		logg.info("Initializing graph server and otp application");
		
		DefaultOtpGraphServer graphService = new DefaultOtpGraphServer(propertiesToParams());
		OTPServer otpServerApp = graphService.startServer();
		OTPApplication otpAppWrapper = new OTPApplication(otpServerApp, ssl);
		
		httpServer.getServerConfiguration().addHttpHandler(
				ContainerFactory.createContainer(HttpHandler.class, otpAppWrapper), "/otp/");	//maybe change to /api/
		
		StaticHttpHandler staticHandler = new StaticWithDefaultHandler("/Map.html");
		staticHandler.addDocRoot(clientRootDir);
		httpServer.getServerConfiguration().addHttpHandler(staticHandler, "/");
		
		//TODO static handler for our client
		
	}
	
	public void run() {
		Thread shutdownThread = new Thread(httpServer::shutdown);
        Runtime.getRuntime().addShutdownHook(shutdownThread);

        try {
        	httpServer.start();
            logg.info("Grizzly server running.");
            Thread.currentThread().join();
        } catch (BindException be) {
        	logg.error("Cannot bind to port {}. Is it already in use?", opts.getProperty(OPTS_PORT));
        } catch (IOException ioe) {
        	logg.error("IO exception while starting server.");
        } catch (InterruptedException ie) {
        	logg.info("Interrupted, shutting down.");
        }

        // Clean up graceful shutdown hook before shutting down Grizzly.
        Runtime.getRuntime().removeShutdownHook(shutdownThread);
        httpServer.shutdown();
	}
	
	private CommandLineParameters propertiesToParams() {
		CommandLineParameters params = getDefaultParams();
		params.build = new File(opts.getProperty(OPTS_OTP_DATA_DIR));
		params.graphDirectory = new File(opts.getProperty(OPTS_GRAPH_DIR));
		params.port = Integer.parseInt(opts.getProperty(OPTS_PORT));
		params.bindAddress = opts.getProperty(OPTS_ADDRESS);
		
		return params;
	}
	
	public static CommandLineParameters getDefaultParams() {
		CommandLineParameters params = new CommandLineParameters();
		params.preFlight = true;
		params.inMemory = true;
		params.autoReload = false;
		params.server = true;
		
		return params;
	}

	private static String default_config_path = "../server-config.cfg";
	public static void main(String[] args) {
		String configPath = args.length > 0 ? args[0] : default_config_path;
		
		Logger mainLogger = LoggerFactory.getLogger("main");
		
		Properties props = null;
		try {
			props = loadProperties(configPath);
		} catch(IOException ioe) {
			mainLogger.error("Exception while reading properties", ioe);
			return;
		}
		
		OtpServerMain serverMain = new OtpServerMain(props);
		try {
			serverMain.start();
		} catch(Throwable t) {
			mainLogger.error("Exception while starting server", t);
			return;
		}
		
		try {
			serverMain.run();
		} catch(Throwable t) {
			mainLogger.error("Unexpected error while running server", t);
		}
		
	}
	
	public static Properties loadProperties(String path) throws IOException {
		File f = new File(path);
		Properties props = new Properties();
		
		try(InputStreamReader reader = new InputStreamReader(new FileInputStream(f))) {
			props.load(reader);
			return props;
		}
	}
	
}
