package it.polimi.tiw.project.controllers;

import java.io.IOException;
import java.sql.Connection;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import javax.servlet.RequestDispatcher;
import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import it.polimi.tiw.project.DAO.UserDAO;
import it.polimi.tiw.project.beans.User;
import it.polimi.tiw.project.utilities.ConnectionHandler;
import it.polimi.tiw.project.utilities.MeetingForm;

@WebServlet("/GoToRecordsPage")
public class GoToRecordsPage extends HttpServlet {
	private static final long serialVersionUID = 1L;
	private Connection connection;

	public GoToRecordsPage() {
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
			//System.out.println("\nDENTRO L'IF DELLA SESSIONE NUOVA IN GOTORECORDSPAGE\n");
			String loginpath = getServletContext().getContextPath() + "/index.html";
			return;
		}

		//create and initialize the form bean with user's input
		String title = request.getParameter("title");
		String startDate = request.getParameter("date");
		String startTime  = request.getParameter("time");
		Integer duration = Integer.parseInt(request.getParameter("duration"));
		Integer maxPart = Integer.parseInt(request.getParameter("maxPart"));
		
		MeetingForm meetF = new MeetingForm(title,startDate,startTime,duration,maxPart);
		
		//the first half is done
		if (meetF.isValid()) {
			//redirect to the RecordsPage.html to select participants
			session.setAttribute("attempt", 1);
			session.setAttribute("meetF", meetF);
			
			UserDAO uDAO = new UserDAO(connection);
			List<User> rUsers = new ArrayList<>();
			List<User> sUsers = new ArrayList<>(); //this will be used to contain selected users in a single attempt
			
			try {
				rUsers = uDAO.getRegisteredUsers();
			} catch (SQLException e) {
				response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Issue with DB");
				return;
			}
			
			String path = "/WEB-INF/RecordsPage.html";
			ServletContext servletContext = getServletContext();
			
			ctx.setVariable("rUsers", rUsers);
			ctx.setVariable("sUsers", sUsers);
			ctx.setVariable("attempt", 1);
			
			
		} else {
			//we should redirect to homepage and display the errors
			String path = "/GoToHomepage";
			
			request.setAttribute("errors", meetF.getErrors());
			
			RequestDispatcher dispatcher = request.getRequestDispatcher(path);
			dispatcher.forward(request, response);
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
