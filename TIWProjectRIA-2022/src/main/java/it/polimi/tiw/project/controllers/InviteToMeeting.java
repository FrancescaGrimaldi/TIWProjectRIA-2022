package it.polimi.tiw.project.controllers;

import java.io.IOException;
import java.sql.Connection;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.annotation.MultipartConfig;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import it.polimi.tiw.project.DAO.MeetingDAO;
import it.polimi.tiw.project.utilities.ConnectionHandler;
import it.polimi.tiw.project.utilities.MeetingForm;

/**
 * This servlet manages the attempts the user has to select the participants for
 * their meeting and creates it if the information is complete and correct.
 */
@WebServlet("/InviteToMeeting")
@MultipartConfig
public class InviteToMeeting extends HttpServlet {
	private static final long serialVersionUID = 1L;
	private Connection connection;

	/**
	 * Class constructor.
	 */
	public InviteToMeeting() {
		super();
	}

	
	/**
	 * Initializes the connection to the database.
	 */
	public void init() throws ServletException {
		ServletContext servletContext = getServletContext();
		
		connection = ConnectionHandler.getConnection(servletContext);
	}


	/**
	 * Gets the numbers and usernames of the users selected as participants for the meeting about to be
	 * created, checks the validity of the information and creates the meeting as soon as the information 
	 * is complete and correct (in accordance with the number of attempts the user has for making this choice).
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		HttpSession session = request.getSession();

		//redirect to the login if the user is not logged in
		if (session.isNew() || session.getAttribute("user") == null) {
			response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().println("Incorrect param values");
			return;
		}
		
		if(session.getAttribute("attempt")!=null && (int)session.getAttribute("attempt") <= 3) {
			String[] sUsernames = request.getParameterValues("id");						//get the usernames of the users selected as participants
			MeetingForm meetF = (MeetingForm)session.getAttribute("meetF");
			int maxPart = meetF.getMaxPart();
			
			if(sUsernames!=null && sUsernames.length <= maxPart) {
				//information is correct (both for the meeting and the participants) -> the meeting can be created and people can be invited to it
				MeetingDAO mDAO = new MeetingDAO(connection);
				
				try {
					int key = mDAO.createMeeting(meetF.getTitle(),meetF.getDate(),meetF.getTime(),meetF.getDuration(),meetF.getMaxPart(),(String)session.getAttribute("user.username"));
					
					for(String s : sUsernames) {
						mDAO.sendInvitation(key, s);
					}
					
					session.removeAttribute("meetF");
					session.removeAttribute("attempt");
					
					response.setStatus(HttpServletResponse.SC_OK);
				} catch(SQLException e) {
					response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
					response.getWriter().println("Issue with DB");
					return;
				}
				
			} else if ((sUsernames==null || sUsernames.length>maxPart) && (int)session.getAttribute("attempt")==3) {
				//the user made three attempts and they always selected an invalid number of participants
				session.removeAttribute("meetF");
				session.removeAttribute("attempt");
				
				response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
				return;
			} else {
				//information is not correct but it's not the last attempt for the user
				int attempt = (int)session.getAttribute("attempt")+1;
				session.setAttribute("attempt", attempt);
				
				List<String> sUsers = new ArrayList<>();
				
				if (sUsernames!=null) {
					for(String s : sUsernames) {
						sUsers.add(s);
					}
				}
				
				//selected users are sent as json
				Gson gson = new GsonBuilder().create();
		        String sUsersJson = gson.toJson(sUsers);

				response.setContentType("application/json");
		        response.setCharacterEncoding("UTF-8");
		        response.getWriter().write(sUsersJson);
		        
		        response.setStatus(HttpServletResponse.SC_ACCEPTED);
			}
			
		}
		
	}

	
	/**
	 * Closes the connection to the database.
	 */
	public void destroy() {
		try {
			ConnectionHandler.closeConnection(connection);
		} catch (SQLException e) {
			e.printStackTrace();
		}
	}


	protected void doGet(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		doPost(request, response);
	}
	
}