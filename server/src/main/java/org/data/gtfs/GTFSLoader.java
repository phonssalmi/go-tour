package org.data.gtfs;

import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.MalformedURLException;
import java.net.URL;

import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;

public class GTFSLoader {
	
	public static final String DEFAULT_PROTOCOL =	"http://";
	public static final String JSON_FIELD_HOST =	"host";
	public static final String JSON_FIELD_PATH =	"gtfspath";
	public static final String JSON_FIELD_DATASET =	"latest";
	public static final String JSON_FIELD_SUBPATH = "subpaths";
	
	private URL url;
	
	public GTFSLoader(String url) throws MalformedURLException {
		this.url = new URL(url);
	}
	
	public void load(File outputDir) throws IOException, ParseException {
		if(!outputDir.exists() || !outputDir.isDirectory()) throw new IllegalArgumentException("File must denote to an existing directory.");
		
		try(InputStreamReader isr = new InputStreamReader(url.openStream())) {
			JSONObject jsonData = (JSONObject)new JSONParser().parse(isr);
			GTFSFileLoader fileLoader = new GTFSFileLoader(getBasePath(jsonData));
			
			JSONArray subPaths = (JSONArray)jsonData.get(JSON_FIELD_SUBPATH);
			for(Object sub : subPaths) {
				String subPath = sub.toString();
				System.out.println("Loading " + subPath);
				fileLoader.load(subPath, new File(outputDir, subPath));
			}
			
		}
	}
	
	
	public String getBasePath(JSONObject json) {
		StringBuilder sb = new StringBuilder();
		sb.append(DEFAULT_PROTOCOL);
		sb.append(json.get(JSON_FIELD_HOST).toString());
		sb.append(json.get(JSON_FIELD_PATH).toString());
		sb.append('/');
		sb.append(json.get(JSON_FIELD_DATASET).toString());
		sb.append('/');
		return sb.toString();
	}
	
	
	private static final String GTFS_MAIN_URL = "http://data.foli.fi/gtfs";
	public static void main(String[] args) {
		try {
			GTFSLoader test = new GTFSLoader(GTFS_MAIN_URL);
			test.load(new File("../../gtfs-data/"));
		} catch(Exception e) {
			e.printStackTrace();
		}
	}
	
	/*private String readSettings(InputStream in) throws IOException {
		StringBuilder sb = new StringBuilder();
		byte[] data = new byte[2048];
		int bytesRead = -1;
		while((bytesRead = in.read(data)) != -1) {
			sb.append(new String(data, 0, bytesRead));
		}
		return sb.toString();
	}*/
	
}
