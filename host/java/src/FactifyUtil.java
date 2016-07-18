/**
 *  Author: Sun SAGONG
 *  Copyright (C) 2016, Genome Institute of Singapore, A*STAR
 *   
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *   (at your option) any later version.
 *   
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *   
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */


import java.io.File;

import utility.utility;

public class FactifyUtil {

		public static String getFileNameMD5(String file_path) {
			File file = new File(file_path);
			String fileNameMD5 = getFileNameMD5(file);
			return fileNameMD5;
		}
		
		public static String getFileNameMD5(File file){
			utility util = new utility();
			String fileNameMD5 = util.MD5(file.getPath()) + "_facts.json";
			return fileNameMD5;
		}
		
}