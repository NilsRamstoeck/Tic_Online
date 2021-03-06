package game.player;

import java.awt.Color;

import game.board.TicField;

public class TicMarble {

	static final public Color[] COLOR_SCHEME = {new Color(255, 0, 0), new Color(0, 255, 0), new Color(255, 255, 0), new Color(0, 0, 255)}; 
	
	public Color color = new Color(0, 0, 0);
	public boolean hasMoved = false;
	public TicPlayer owner;
	public String area;
	public int pos;
	private int id;

	public boolean done = false;
	
	TicMarble(int _id, TicPlayer _owner) {
		id = _id;
		owner = _owner;
	}
	
	public void setColor(){
		color = COLOR_SCHEME[owner.getId()];

	}


	public boolean moveToStart() {
		TicField[] start = owner.game.getBoard().getStartArea(owner.getId()).fields;
		for (TicField f : start) {
			if (!f.hasOccupant()) {
				f.place(this);
				return true;
			}
		}
		return false;
	}

	public int getId() {
		return id;
	}

}
