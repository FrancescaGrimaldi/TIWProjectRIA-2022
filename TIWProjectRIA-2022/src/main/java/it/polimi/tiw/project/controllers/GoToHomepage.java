package it.polimi.tiw.project.controllers;

import java.io.IOException;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.UnavailableException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import it.polimi.tiw.project.DAO.MeetingDAO;
import it.polimi.tiw.project.DAO.UserDAO;
import it.polimi.tiw.project.beans.Meeting;
import it.polimi.tiw.project.beans.User;

@WebServlet("/GoToHomepage")
public class GoToHomepage extends HttpServlet {
	private static final long serialVersionUID = 1L;
	private Connection connection;

	
	public GoToHomepage() {
		super();
	}

	
	public void init() throws ServletException {
		try {
			ServletContext servletContext = getServletContext();	
			String driver = servletContext.getInitParameter("dbDriver");
			String url = servletContext.getInitParameter("dbUrl");
			String user = servletContext.getInitParameter("dbUser");
			String password = servletContext.getInitParameter("dbPassword");
			Class.forName(driver);
			connection = DriverManager.getConnection(url, user, password);

		} catch (ClassNotFoundException e) {
			throw new UnavailableException("Can't load database driver");
		} catch (SQLException e) {
			throw new UnavailableException("Couldn't get db connection");
		}
	}
	
	
	protected void doGet(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		
		// If the user is not logged in (not present in session) redirect to the login
		HttpSession session = request.getSession();
		
		if (session.isNew() || session.getAttribute("user") == null) {
			response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().println("Incorrect param values");
			return;
		}
		
		User u = (User)session.getAttribute("user");
		MeetingDAO mDAO = new MeetingDAO(connection);
		UserDAO uDAO = new UserDAO(connection);
		
		List<Meeting> cMeetings = new ArrayList<>();
		List<Meeting> iMeetings = new ArrayList<>();
		
		
		//there is a problem for which if there are no created or invited meetings, homepage doesn't display
		try {
			cMeetings = mDAO.findCreatedMeetings(u);
		} catch (SQLException e) {
			response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
			response.getWriter().println("Not possible to recover created meetings");
			return;
		}
		
		try {
			iMeetings = mDAO.findInvitedMeetings(u);
			for (Meeting m : iMeetings) {
				m.setCreatorUsername(uDAO.getNickByID(m.getCreatorID()));
			}
		} catch (SQLException e) {
			response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
			response.getWriter().println("Not possible to recover invited meetings");
			return;
		}

		// Refresh and add meetings to the parameters
		// confused about this
		Gson gson = new GsonBuilder().setDateFormat("yyyy-MM-dd").create();
        String cMeetingsJson = gson.toJson(cMeetings);
        String iMeetingsJson = gson.toJson(iMeetings);
		
		String errors = (String)request.getAttribute("errors");

		response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write(cMeetingsJson);
        response.getWriter().write(iMeetingsJson);
        response.getWriter().write(errors); 			//???????????
	}

	
	protected void doPost(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		doGet(request, response);
	}
	
	
	public void destroy() {
		try {
			if (connection != null) {
				connection.close();
			}
		} catch (SQLException sqle) {
		}
	}
	
}