package it.polimi.tiw.project.controllers;

import java.io.IOException;
import java.sql.Connection;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import it.polimi.tiw.project.DAO.MeetingDAO;
import it.polimi.tiw.project.DAO.UserDAO;
import it.polimi.tiw.project.beans.User;
import it.polimi.tiw.project.utilities.ConnectionHandler;
import it.polimi.tiw.project.utilities.MeetingForm;

@WebServlet("/InvitePeople")
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
			String loginpath = getServletContext().getContextPath() + "/index.html";
			response.sendRedirect(loginpath);
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
					
					String ctxpath = getServletContext().getContextPath();
					String path = ctxpath + "/GoToHomepage";
					response.sendRedirect(path);
				} catch(SQLException e3) {
					response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Issue with DB");
					return;
				}
				
			} else if (sUsernames.length > maxPart && (int)session.getAttribute("attempt")==3) {
				session.removeAttribute("meetF");
				session.removeAttribute("attempt");
				
				String path = "/WEB-INF/CancellationPage.html";
				ServletContext servletContext = getServletContext();
				
			} else {

				int attempt = (int)session.getAttribute("attempt")+1;
				session.setAttribute("attempt", attempt);
				
				UserDAO uDAO = new UserDAO(connection);
				List<User> rUsers = new ArrayList<>();
				List<String> sUsers = new ArrayList<>();
				
				try {
					rUsers = uDAO.getRegisteredUsers();
				} catch (SQLException e) {
					e.printStackTrace();
				}
				
				for(String s : sUsernames) {
					sUsers.add(s);
				}
				
				int toDeselect = sUsernames.length-maxPart;
				
				String path = "/WEB-INF/RecordsPage.html";
				ServletContext servletContext = getServletContext();
				
				ctx.setVariable("rUsers", rUsers);
				ctx.setVariable("sUsers", sUsers);
				ctx.setVariable("toDeselect", toDeselect);
				ctx.setVariable("attempt", attempt);
				
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