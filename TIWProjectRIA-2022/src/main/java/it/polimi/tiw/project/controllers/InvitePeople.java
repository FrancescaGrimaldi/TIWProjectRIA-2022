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

@WebServlet("/InvitePeople")
@MultipartConfig
public class InvitePeople extends HttpServlet {
	private static final long serialVersionUID = 1L;
	private Connection connection;

	
	public InvitePeople() {
		super();
	}

	
	public void init() throws ServletException {
		ServletContext servletContext = getServletContext();
		
		connection = ConnectionHandler.getConnection(servletContext);
			
	}
	
	
	protected void doGet(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		doPost(request, response);
	}

	
	protected void doPost(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		// If the user is not logged in (not present in session) redirect to the login
		HttpSession session = request.getSession();
		if (session.isNew() || session.getAttribute("user") == null) {
			response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().println("Incorrect param values");
			return;
		}
		
		if(session.getAttribute("attempt")!=null && (int)session.getAttribute("attempt") <= 3) {
			String[] sUsernames = request.getParameterValues("id");
			
			MeetingForm meetF = (MeetingForm)session.getAttribute("meetF");
			int maxPart = meetF.getMaxPart();
			
			if(sUsernames.length <= maxPart) {
				// arrived at this point we have the correct information
				// both regarding the meeting and the participants -> we can create the meeting and invite people to it
				MeetingDAO mDAO = new MeetingDAO(connection);
				
				try {
					int key = mDAO.createMeeting(meetF.getTitle(),meetF.getDate(),meetF.getTime(),meetF.getDuration(),meetF.getMaxPart(),(String)session.getAttribute("user.username"));
					
					for(String s : sUsernames) {
						mDAO.sendInvitation(key, s);
					}
					
					session.removeAttribute("meetF");
					session.removeAttribute("attempt");
					
					response.setStatus(HttpServletResponse.SC_OK);
				} catch(SQLException e3) {
					response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
					response.getWriter().println("Issue with DB");
					return;
				}
				
			} else if (sUsernames.length > maxPart && (int)session.getAttribute("attempt")==3) {
				session.removeAttribute("meetF");
				session.removeAttribute("attempt");
				
				response.sendError(HttpServletResponse.SC_BAD_REQUEST);
				return;
			} else {

				int attempt = (int)session.getAttribute("attempt")+1;
				session.setAttribute("attempt", attempt);
				
				List<String> sUsers = new ArrayList<>();
				
				for(String s : sUsernames) {
					sUsers.add(s);
				}
				
				Gson gson = new GsonBuilder().create();
		        String sUsersJson = gson.toJson(sUsers);

				response.setContentType("application/json");
		        response.setCharacterEncoding("UTF-8");
		        response.getWriter().write(sUsersJson);
		        
		        response.setStatus(HttpServletResponse.SC_ACCEPTED);
			}
			
		}
		
	}

	
	public void destroy() {
		try {
			ConnectionHandler.closeConnection(connection);
		} catch (SQLException e) {
			e.printStackTrace();
		}
	}
	
}