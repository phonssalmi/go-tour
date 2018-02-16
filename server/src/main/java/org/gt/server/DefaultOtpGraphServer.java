package org.gt.server;

import java.io.File;

import org.opentripplanner.graph_builder.GraphBuilder;
import org.opentripplanner.routing.graph.Graph;
import org.opentripplanner.routing.impl.DefaultStreetVertexIndexFactory;
import org.opentripplanner.routing.impl.InputStreamGraphSource;
import org.opentripplanner.routing.impl.MemoryGraphSource;
import org.opentripplanner.routing.services.GraphService;
import org.opentripplanner.standalone.CommandLineParameters;
import org.opentripplanner.standalone.OTPServer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class DefaultOtpGraphServer {
	private GraphService graphSrvc;
	private CommandLineParameters opts;
	private File graphDirectory;

	private Logger logg = LoggerFactory.getLogger(this.getClass());
	
	public DefaultOtpGraphServer(CommandLineParameters options) {
		opts = options;
		if (!opts.graphDirectory.exists() || !opts.graphDirectory.isDirectory())
			throw new IllegalArgumentException("Graph directory path must denote to an existing directory");
		
		if (!opts.build.exists() || !opts.build.isDirectory())
			throw new IllegalArgumentException("Build directory path must denote to an existing directory");
	}

	public OTPServer startServer() {
		initDefaultGraphService();
		OTPServer srv = new OTPServer(opts, graphSrvc);
		
		GraphBuilder graphBuilder = GraphBuilder.forDirectory(opts, opts.build);
		if (graphBuilder != null) {
			graphBuilder.run();
			Graph graph = graphBuilder.getGraph();
			graph.index(new DefaultStreetVertexIndexFactory());
			// FIXME set true router IDs
			graphSrvc.registerGraph("", new MemoryGraphSource("", graph));
			
		} else {
			logg.error("An error occurred while building the graph. Exiting.");
			System.exit(-1);
		}
		
		return srv;
	}
	
	public GraphService initDefaultGraphService() {
		graphSrvc = new GraphService(false);
		InputStreamGraphSource.FileFactory graphSourceFactory = new InputStreamGraphSource.FileFactory(graphDirectory);
		graphSourceFactory.basePath = graphDirectory;
		graphSrvc.graphSourceFactory = graphSourceFactory;

		return graphSrvc;
	}

	
	/*private void setGraphDir(String path) throws IllegalArgumentException {
		File grpDir = new File(path);
		if (!grpDir.exists() || !grpDir.isDirectory())
			throw new IllegalArgumentException("Path must denote to an existing directory");
		graphDirectory = grpDir;
	}*/

}
